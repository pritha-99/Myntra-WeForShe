import sys
import os
import shutil
import json
import argparse
import tempfile
from PIL import Image
from gradio_client import Client, handle_file

def prepare_image(image_path):
    """Converts image to clean PNG RGB format to prevent PIL format errors."""
    try:
        img = Image.open(image_path)
        rgb_img = Image.new('RGB', img.size, (255, 255, 255))
        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
            img_rgba = img.convert('RGBA')
            rgb_img.paste(img_rgba, mask=img_rgba.split()[3])
        else:
            rgb_img.paste(img.convert('RGB'))

        tmp = tempfile.NamedTemporaryFile(suffix='.png', delete=False)
        rgb_img.save(tmp.name, format='PNG', quality=95)
        return tmp.name
    except Exception:
        return image_path

def format_editor_data(data):
    """Formats ImageEditor dict for Gradio schema compatibility."""
    if isinstance(data, str):
        return handle_file(prepare_image(data))
    if isinstance(data, dict):
        if 'path' in data and isinstance(data['path'], str):
            return handle_file(prepare_image(data['path']))
        return {k: format_editor_data(v) for k, v in data.items()}
    if isinstance(data, list):
        return [format_editor_data(item) for item in data]
    return data

def run_catvton(person_path, garment_path, output_path, cloth_type="upper", steps=20, guidance=2.5, seed=42):
    try:
        hf_token = os.getenv("HF_TOKEN") or os.getenv("HUGGING_FACE_HUB_TOKEN")
        if hf_token:
            client = Client("zhengchong/CatVTON", token=hf_token)
        else:
            client = Client("zhengchong/CatVTON")

        person_png = prepare_image(person_path)
        garment_png = prepare_image(garment_path)

        # Step 1: Convert model image to ImageEditor format (model2.md)
        person = client.predict(
            image_path=handle_file(person_png),
            api_name="/person_example_fn"
        )

        person_formatted = format_editor_data(person)

        # Step 2: Generate try-on image (model2.md)
        result = client.predict(
            person_image=person_formatted,
            cloth_image=handle_file(garment_png),
            cloth_type=cloth_type,
            num_inference_steps=int(steps),
            guidance_scale=float(guidance),
            seed=int(seed),
            show_type="result only",
            api_name="/submit_function"
        )

        # Extract output path
        if isinstance(result, dict) and "path" in result:
            result_file = result["path"]
        elif isinstance(result, (list, tuple)) and len(result) > 0:
            result_file = result[0]
        else:
            result_file = str(result)

        if not os.path.exists(result_file):
            raise FileNotFoundError(f"Output file not found: {result_file}")

        # Step 3: Save generated image to output path
        shutil.copy(result_file, output_path)

        print(json.dumps({
            "status": "success",
            "output_path": output_path
        }))
        return True

    except Exception as e:
        print(json.dumps({
            "status": "error",
            "error": str(e)
        }), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CatVTON Model2 Integration")
    parser.add_argument("--person", required=True)
    parser.add_argument("--garment", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--cloth_type", default="upper")
    parser.add_argument("--steps", type=int, default=20)
    parser.add_argument("--guidance", type=float, default=2.5)
    parser.add_argument("--seed", type=int, default=42)

    args = parser.parse_args()

    run_catvton(
        person_path=args.person,
        garment_path=args.garment,
        output_path=args.output,
        cloth_type=args.cloth_type,
        steps=args.steps,
        guidance=args.guidance,
        seed=args.seed
    )
