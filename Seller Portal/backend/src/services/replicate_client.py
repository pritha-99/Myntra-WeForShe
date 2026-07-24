"""
Replicate FLUX Kontext Pro client for Myntra garment catalog generation.

Usage:
    python3 replicate_client.py --garment <path> --output <path> [--pose front|back]
"""

import sys
import os
import json
import time
import argparse
import tempfile
import urllib.request
import urllib.error

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

MODEL_VERSION = "black-forest-labs/flux-kontext-pro"

PROMPT = (
    "The input image contains a garment. Generate a photorealistic full-body fashion "
    "model wearing the exact garment shown in the input image. Preserve every design "
    "detail including color, graphics, logos, prints, stitching, seams, neckline, "
    "sleeve length, cuffs, fabric texture, material, fit, and proportions exactly. "
    "Do not modify or invent any garment details. Create a professional fashion model "
    "with a natural pose, studio lighting, and a light gray background with a soft shadow suitable for "
    "an e-commerce fashion catalog. Ensure realistic fabric drape, folds, wrinkles, "
    "and shadows while keeping the garment identical to the input."
)

MAX_RETRIES = 3
RETRY_DELAY_S = 5
POLL_INTERVAL_S = 3
TIMEOUT_S = 120


# ---------------------------------------------------------------------------
# Replicate REST helpers (no SDK dependency)
# ---------------------------------------------------------------------------

def _api_token():
    token = os.environ.get("REPLICATE_API_TOKEN", "")
    if not token:
        raise EnvironmentError("REPLICATE_API_TOKEN environment variable is not set.")
    return token


def _headers():
    return {
        "Authorization": f"Bearer {_api_token()}",
        "Content-Type": "application/json",
        "Prefer": "wait",
    }


def _post_json(url, payload):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=_headers(), method="POST")
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _get_json(url):
    req = urllib.request.Request(url, headers=_headers(), method="GET")
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _upload_file_to_replicate(image_path):
    """Upload a local image file to Replicate's Files API and return the hosted file URL."""
    token = _api_token()
    file_size = os.path.getsize(image_path)
    filename = os.path.basename(image_path)
    ext = os.path.splitext(image_path)[1].lower().lstrip(".")
    content_type = "image/jpeg" if ext in ("jpg", "jpeg") else f"image/{ext}"

    # Step 1: Create file upload slot
    create_url = "https://api.replicate.com/v1/files"
    req_body = json.dumps({"name": filename, "size": file_size, "content_type": content_type}).encode("utf-8")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    req = urllib.request.Request(create_url, data=req_body, headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=30) as resp:
        slot = json.loads(resp.read().decode("utf-8"))

    upload_url = slot.get("upload_url")
    file_url = slot.get("urls", {}).get("get") or slot.get("file_url") or slot.get("url")

    # Step 2: Upload file content to upload_url (or file_url)
    target_upload_url = upload_url or file_url
    with open(image_path, "rb") as f:
        raw_data = f.read()

    put_req = urllib.request.Request(
        target_upload_url,
        data=raw_data,
        headers={"Content-Type": content_type},
        method="PUT"
    )
    with urllib.request.urlopen(put_req, timeout=60) as resp:
        pass

    return file_url


def _image_to_data_uri(image_path):
    """Convert local image file to base64 data URI or Replicate hosted file URL."""
    try:
        return _upload_file_to_replicate(image_path)
    except Exception as e:
        import base64
        with open(image_path, "rb") as f:
            raw = f.read()
        ext = os.path.splitext(image_path)[1].lower().lstrip(".")
        mime = "jpeg" if ext in ("jpg", "jpeg") else ext
        b64 = base64.b64encode(raw).decode("utf-8")
        return f"data:image/{mime};base64,{b64}"


# ---------------------------------------------------------------------------
# Core generation function
# ---------------------------------------------------------------------------

def generate_on_model(garment_path, output_path, pose="front"):
    """
    Call Replicate FLUX Kontext Pro with the garment image and save the result.

    Args:
        garment_path: Path to the flat-lay garment image (local file).
        output_path:  Where to write the generated PNG/JPEG.
        pose:         "front" or "back" — informational, affects prompt suffix.

    Returns:
        dict: {"status": "success", "output_path": output_path}

    Raises:
        RuntimeError on non-retryable failures.
    """
    pose_hint = "Show the front of the garment." if pose == "front" else "Show the back of the garment."
    full_prompt = f"{PROMPT} {pose_hint}"

    garment_uri = _image_to_data_uri(garment_path)

    payload = {
        "input": {
            "prompt": full_prompt,
            "input_image": garment_uri,
            "output_format": "jpg",
            "safety_tolerance": 2,
        }
    }

    last_err = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            # Submit prediction
            prediction = _post_json(
                "https://api.replicate.com/v1/models/black-forest-labs/flux-kontext-pro/predictions",
                payload
            )

            pred_id = prediction.get("id")
            if not pred_id:
                raise RuntimeError(f"No prediction ID in response: {prediction}")

            # Poll until done
            deadline = time.time() + TIMEOUT_S
            while time.time() < deadline:
                status_data = _get_json(
                    f"https://api.replicate.com/v1/predictions/{pred_id}"
                )
                status = status_data.get("status")

                if status == "succeeded":
                    output = status_data.get("output")
                    if isinstance(output, list):
                        image_url = output[0]
                    elif isinstance(output, str):
                        image_url = output
                    else:
                        raise RuntimeError(f"Unexpected output format: {output}")

                    # Download result image
                    urllib.request.urlretrieve(image_url, output_path)
                    print(json.dumps({"status": "success", "output_path": output_path}))
                    return {"status": "success", "output_path": output_path}

                elif status == "failed":
                    err = status_data.get("error") or "Unknown Replicate error"
                    raise RuntimeError(f"Replicate prediction failed: {err}")

                elif status in ("canceled",):
                    raise RuntimeError("Replicate prediction was canceled.")

                time.sleep(POLL_INTERVAL_S)

            raise RuntimeError(f"Timed out waiting for Replicate prediction {pred_id}.")

        except urllib.error.HTTPError as exc:
            err_body = ""
            try:
                err_body = exc.read().decode("utf-8")
            except Exception:
                pass
            last_err = f"HTTP Error {exc.code}: {exc.reason} - {err_body}"
            if attempt < MAX_RETRIES:
                wait_time = (RETRY_DELAY_S * attempt) if exc.code != 429 else 10
                print(
                    json.dumps({"status": "retrying", "attempt": attempt, "reason": last_err}),
                    file=sys.stderr
                )
                time.sleep(wait_time)
            else:
                break
        except (urllib.error.URLError, RuntimeError, OSError) as exc:
            last_err = str(exc)
            if attempt < MAX_RETRIES:
                print(
                    json.dumps({"status": "retrying", "attempt": attempt, "reason": last_err}),
                    file=sys.stderr
                )
                time.sleep(RETRY_DELAY_S * attempt)
            else:
                break

    print(json.dumps({"status": "error", "error": str(last_err)}), file=sys.stderr)
    sys.exit(1)


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="FLUX Kontext Pro on-model image generator")
    parser.add_argument("--garment", required=True, help="Path to the garment flat-lay image")
    parser.add_argument("--output", required=True, help="Destination path for the generated image")
    parser.add_argument("--pose", default="front", choices=["front", "back"],
                        help="Garment pose context (default: front)")

    args = parser.parse_args()
    generate_on_model(
        garment_path=args.garment,
        output_path=args.output,
        pose=args.pose,
    )
