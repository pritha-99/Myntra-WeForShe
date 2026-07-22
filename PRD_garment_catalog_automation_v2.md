# PRD: Automated Garment On-Model Catalog Generation
**Project:** Myntra WeForShe Hackathon — Seller Onboarding Portal
**Feature:** Auto-generate front / side / back on-model catalog images from seller-uploaded flat-lay garment photos
**Scope:** MVP, single-day build, CPU-only for vision stages, Gemini for generation
**Status:** Draft v2 — supersedes v1 (single-photo, flat-image MVP)

---

## 1. Problem Statement

Artisan sellers on the platform upload garment photos taken on phones — inconsistent backgrounds, poor lighting, off-center framing, no adherence to marketplace image standards. Myntra-style catalogs require **front, side, and back on-model views**. Sellers don't have models, photographers, or editing skill to produce this themselves.

This feature takes **seller-uploaded flat-lay garment photos** (front, back, plus optional fabric/embroidery detail and other reference shots) and automatically produces **three on-model catalog images — front, side, and back** — by compositing the garment onto locally-stored stock model images via Gemini.

## 2. Goals (MVP)

- Given a front garment photo and a back garment photo (flat-lay), generate three on-model images: front, side, back.
- Each generated image uses a corresponding locally-stored stock model pose image (front stock, back stock, side stock) as the "wearer" reference.
- Additional seller-uploaded images (fabric/embroidery detail, extra angles — up to 5) are **not** used for generation. They pass through the same compliance-validation checklist as the generated images, for the seller's own reference/records.
- Validate every delivered image (3 generated on-model + up to 5 additional) against a defined subset of Myntra image guidelines, pass/fail per rule, per image.
- Whole pipeline is CPU-only except the Gemini generation calls.
- Each Gemini generation call runs independently; failure of one view does not block delivery of the other two (partial delivery is acceptable).

## 3. Non-Goals (explicitly out of scope for this MVP)

| Guideline | Why out of scope for MVP |
|---|---|
| Flat product (non-model) catalog image as a deliverable | Explicitly dropped in v2 — output is on-model images only, no flat cutout image. |
| Fabric/embroidery detail as a generation input | Detail image is compliance-checked only; it does not condition any Gemini call. |
| Ironed/crease-free product condition check | Requires a dedicated crease-detection model; not in scope. |
| Consistent skin tone check across on-model shots | Stock model images are fixed/pre-selected; not a per-seller variable. |
| USP not hidden by hands | Not automatable without a fine-tuned detector; flagged as future work. |
| Dust/stain/scratch detection (accessories/footwear) | Different product category; this MVP is garment-only. |
| Multi-image counts for non-garment categories | Out of scope; garment-only MVP. |
| Mirrored-image / right-leg-only footwear checks | Footwear-specific; out of scope. |
| YOLOv8 object detection | Removed entirely per v2 decision — cropping now runs on BiRefNet's foreground mask directly. |

**Decision:** MVP targets **apparel/garment only**. Seller provides flat-lay front + back photos (required) and up to 5 additional reference images (optional, e.g. fabric detail). Output is exactly 3 on-model images (front/side/back), each validated against the compliance checklist. Additional seller images are validated but never used for generation.

## 4. User Flow

```
Seller (onboarding portal) is asked, in order:
  1. Upload FRONT garment photo (flat-lay)         — required
  2. Upload BACK garment photo (flat-lay)           — required
  3. Upload additional images (max 5)                — optional
     e.g. fabric/embroidery detail, other angles
        │
        ▼
Backend pipeline runs automatically (no further seller action needed)
        │
        ▼
For each of front / back garment photos:
  - Crop via BiRefNet foreground mask bounding box
  - Background-remove via BiRefNet (fallback: rembg)
        │
        ▼
Gemini generation — 3 independent calls:
  - Front call:  cropped front garment + FRONT stock model image  → on-model FRONT render
  - Back call:   cropped back garment  + BACK stock model image   → on-model BACK render
  - Side call:   cropped front + cropped back garment + SIDE stock model image → on-model SIDE render
  (each call has its own timeout; failure of one does not block the other two)
        │
        ▼
Compliance validation runs on:
  - All successfully generated on-model images (up to 3)
  - All additional seller-uploaded images (up to 5), unchanged, for reference only
        │
        ▼
Seller sees:
  - Whichever on-model images succeeded (1–3 of them)
  - A compliance checklist per delivered image (pass/fail/warning per rule)
        │
        ▼
Seller approves → image(s) saved to product doc in MongoDB → visible on Customer Marketplace storefront
```

## 5. Functional Requirements — Pipeline Stages

### Stage 0 — Input validation
- Accept JPEG/PNG/HEIC upload; convert to JPEG.
- Front and back garment photos are **required**; reject submission (with a clear seller-facing message) if either is missing.
- Additional images: optional, capped at **5**. Reject the 6th+ upload with a clear message.
- Reject any individual file if unreadable, corrupted, or below a minimum resolution floor (shorter side < 400px), with a clear error ("photo too low-resolution, please retake").

### Stage 1 — Garment crop (BiRefNet foreground mask, no YOLO)
- Run BiRefNet on the front and back garment photos to obtain a foreground mask.
- Derive a bounding box from the mask directly (YOLOv8 is removed from the pipeline entirely — no object-detection step).
- Crop to bounding box with a small margin.
- **This cropping step is applied only to the front and back garment photos** (the ones feeding generation). Additional/detail images are not cropped — they go straight to compliance validation as uploaded.

### Stage 2 — Background removal (BiRefNet, fallback: rembg)
- Run BiRefNet on the cropped front/back garment images to produce a foreground mask + transparent cutout.
- If BiRefNet inference time is too slow on CPU during testing, fall back to `rembg`.
- Output: clean garment cutouts, ready to hand to Gemini as generation input.

### Stage 3 — On-model generation (Gemini 2.5 Flash Image, 3 independent calls)

| Call | Inputs | Output |
|---|---|---|
| Front | Cropped front garment cutout + **front stock model image** | On-model front render |
| Back | Cropped back garment cutout + **back stock model image** | On-model back render |
| Side | Cropped front garment cutout + cropped back garment cutout + **side stock model image** | On-model side render |

- Stock model images (front/back/side poses) are stored **locally** — not user-supplied, not requested from the seller at any point.
- Prompt for each call specifies: garment worn by the model, preserve exact pattern/color/texture/embroidery, light grey background, soft shadow, consistent with Myntra on-model presentation standards.
- Timeout per call: ~8–10s.
- **Calls are independent.** If one call fails or times out, skip it silently and continue — the other 1–2 successful renders are still delivered. There is no all-or-nothing dependency between front/back/side.
- No footwear/accessory try-on attempted — garment-only.

### Stage 4 — Rule-based guideline validation (OpenCV / Tesseract)

Runs on **every delivered image**: each successfully generated on-model image (front/side/back, whichever succeeded) **and** every additional seller-uploaded image (fabric detail, extra angles, etc., up to 5). Same rule set for all — on-model renders are validated exactly the same way flat images were in v1, since the underlying guideline checks (background, blur, dimensions, etc.) don't change based on whether a model is in frame.

| Rule | Check method |
|---|---|
| File size 500KB–1MB | Direct file size check post-compression |
| Dimensions ≥1080×1440, 3:4 ratio | Direct metadata check |
| JPEG format | Direct format check |
| Light grey/white background | Sample corner/background region pixels, check near-neutral color within tolerance band |
| Not blurred | Laplacian variance threshold |
| No part of product out of focus | Same blur metric applied to product/garment region specifically (mask-based) |
| No text/watermark visible | Best-effort lightweight OCR pass (Tesseract); flagged as "best effort" to judges |
| No price tag/sticker visible | Not automatable in one day — seller self-declaration checkbox instead of AI detection |

- Output: a structured JSON of rule → pass/fail/warning, **per image**, shown to the seller as a per-image checklist.

## 6. Data Model Changes (MongoDB)

Compliance is now per-image (array), not a single object, since up to 8 images (3 generated + 5 additional) may need independent reports.

```json
{
  "images": {
    "front": {
      "original": "url",
      "onModel": "url | null",
      "generationStatus": "success | failed | skipped",
      "complianceReport": {
        "fileSize": "pass",
        "dimensions": "pass",
        "format": "pass",
        "background": "pass",
        "blur": "pass",
        "watermarkCheck": "warning",
        "priceTagDeclared": "seller_confirmed"
      }
    },
    "back": { "...same shape as front..." },
    "side": {
      "onModel": "url | null",
      "generationStatus": "success | failed | skipped",
      "complianceReport": { "...": "..." }
    },
    "additional": [
      {
        "original": "url",
        "label": "fabric_detail | other",
        "complianceReport": { "...": "..." }
      }
    ],
    "generatedAt": "timestamp"
  }
}
```

## 7. Non-Functional Requirements

- **CPU-only** for Stages 0–2 and Stage 4. No stage other than Stage 3 (Gemini) may assume GPU or paid infra.
- **Free-tier only** apart from Gemini API (already integrated).
- **Resilience over completeness.** Each of the 3 Gemini calls is independent; a failed or slow call must never block delivery of the other successful renders, and must never block the compliance step for additional images.
- **Demo latency budget:** with 3 independent Gemini calls (front/back/side) instead of 1, total on-model generation time will be higher than the v1 single-call budget. Recommend raising this to judges as an explicit tradeoff (parallelizing the 3 calls, rather than running sequentially, should be the default implementation to keep wall-clock time down) rather than silently absorbing it.

## 8. Edge Cases

- Seller uploads only front, no back (or vice versa) → reject submission at Stage 0 with a clear message; both are required since the side-view call depends on both.
- Front or back garment photo is a poor crop candidate for BiRefNet (e.g., very low contrast against background) → acceptable in MVP to flag as a known limitation, not blocking.
- One or two of the three Gemini calls fail/time out → deliver whichever succeeded; seller still sees a checklist for those, and is informed the missing view(s) are unavailable.
- Seller uploads 6th additional image → reject with a clear "maximum 5 additional images" message.
- Gemini free-tier quota exhausted mid-demo → must not crash the flow; catch per-call and fall back to whatever succeeded before quota ran out.

## 9. Day-1 Build Checklist (rough order)

1. Stage 0 (input validation: front/back required, additional images capped at 5).
2. Stage 1 (BiRefNet-mask-based crop — confirm no YOLO dependency remains anywhere in the pipeline).
3. Stage 2 (background removal) — test BiRefNet timing on CPU; swap to rembg if too slow.
4. Stage 3 (3 parallel Gemini calls: front+front-stock, back+back-stock, front+back+side-stock) — wire up with independent timeouts/fallbacks per call.
5. Stage 4 (rule validation) — apply to all delivered images (generated + additional), write per-image checklist, display in UI.
6. Wire pipeline into existing Express upload route → MongoDB (new per-image data model).
7. Buffer time for demo-script testing on real test images (not just clean sample images), specifically testing the partial-delivery path (one Gemini call deliberately failing).

---

## 10. Resolved Decisions (from v1 open questions)

1. **YOLOv8n:** Removed entirely. Cropping now uses BiRefNet's foreground mask bounding box directly.
2. **Side view:** Accepted as best-effort — generated from front + back garment images plus a locally-stored side stock model image; no side garment photo exists or is requested.
3. **Stock model images:** Stored locally, three poses (front/back/side), never sourced from or selected by the seller.
4. **Price-tag/sticker detection:** Confirmed — seller self-declaration checkbox, not AI detection.
5. **Watermark/text detection:** Confirmed — best-effort OCR, disclosed as a limitation.
6. **Flat catalog image:** Confirmed dropped as a deliverable. On-model images are the only output.
7. **Fabric detail / additional images:** Confirmed — compliance-checked only, never used as generation input.
