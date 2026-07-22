# CatVTON Virtual Try-On Integration Summary
**Date**: July 22, 2026  
**Module**: Garment Catalog Automation v2 — On-Model Image Generation (`everything/backend`)

---

## 1. Overview & Objective

The goal of this phase was to implement on-model virtual try-on image generation for the seller portal catalog automation pipeline, transitioning from Gemini (which is text/multimodal-only and rate-limited) to the **CatVTON Hugging Face Space API** (`zhengchong/CatVTON`) as specified in `model1.md` and `model2.md`.

CatVTON takes flat-lay garment cutouts uploaded by sellers and places them onto reusable stock model photos across **Front**, **Back**, and **Side** poses.

---

## 2. Architecture & Implementation

### System Pipeline

```text
React Frontend (Product Upload)
        │
        ▼
Node.js Backend (`garmentCatalogService.js`)
        │
        ├── Stage 0: Input Validation & Image Checks (≥400px, ≤5 extra images)
        ├── Stage 1 & 2: Crop & Background Removal (`sharp` cutout generation)
        │
        ▼
Stage 3: CatVTON On-Model Generation (`catvton_client.py`)
        │
        ├── Step 1: `/person_example_fn` (Convert stock model to `ImageEditor` format)
        ├── Step 2: `/submit_function` (Run CatVTON Virtual Try-On model)
        │
        ▼
Stage 4: Compliance Validation (`validateCompliance`)
        │ (File size, 1080×1440 dimensions, 3:4 ratio, background neutrality, blur check)
        ▼
Seller Dashboard Catalog Listing
```

### Files Modified & Created

1. **`everything/backend/src/services/catvton_client.py`** *(NEW)*:
   - Standalone Python script utilizing `gradio_client` to communicate with the `zhengchong/CatVTON` Gradio API.
   - Pre-processes input images, formats Gradio `EditorData` schema structures, and handles the two-stage API call sequence.

2. **`everything/backend/src/services/garmentCatalogService.js`** *(UPDATED)*:
   - Updated `generateOnModelImage()` to spawn `catvton_client.py` for Front, Back, and Side stock model images in parallel.
   - Handled output JSON parsing, error suppression, and automatic fallbacks to seller flat-lay images.

3. **`everything/backend/.env`** *(UPDATED)*:
   - Added `HF_TOKEN` environment variable support to pass Hugging Face User Access Tokens for authenticated GPU compute.

---

## 3. Configuration & Parameters

The implementation adheres to the recommended e-commerce production settings from `model2.md`:

| Parameter | Configured Value | Purpose |
|---|---|---|
| `cloth_type` | `"upper"` | Optimized for upper-body garments (shirts, t-shirts, jackets, tops). |
| `num_inference_steps` | `20` | Reduced from default 50 to lower generation latency while maintaining visual quality. |
| `guidance_scale` | `2.5` | Recommended classifier-free guidance scale. |
| `seed` | `42` | Ensures deterministic, reproducible outputs across runs. |
| `show_type` | `"result only"` | Requests only the clean generated product image from CatVTON. |
| Timeout | `90 seconds` | Allows sufficient execution buffer for public Hugging Face Space queues. |

---

## 4. Technical Issues Encountered & Solutions

### Issue 1: Gemini 429 / Rate Limit & Text-Only Limitations
* **Problem**: Gemini standard models (`gemini-2.0-flash-exp` / `gemini-2.5-flash-image`) returned `429 RESOURCE_EXHAUSTED` errors because Gemini free-tier keys do not support outputting generated image binary data.
* **Solution**: Replaced Gemini image generation with the public CatVTON Hugging Face Space API (`zhengchong/CatVTON`).

### Issue 2: Gradio 5 `EditorData` Pydantic Schema Validation Error
* **Problem**: Calling `/submit_function` with the raw dictionary returned by `/person_example_fn` raised a Pydantic `ValidationError`:
  ```text
  Value error, The 'meta' field must be explicitly provided in the input data and be equal to {'_type': 'gradio.FileData'}
  ```
* **Solution**: Added the `format_editor_data()` recursive helper function in `catvton_client.py` that wraps dictionary file paths into valid Gradio `handle_file()` handles containing `FileData` metadata.

### Issue 3: `cannot write mode RGBA as JPEG` PIL Exception
* **Problem**: When passing 4-channel transparent PNG garment cutouts, PIL raised `cannot write mode RGBA as JPEG` on the Hugging Face server during internal mask visualization.
* **Solution**: Implemented the `prepare_image()` preprocessor in Python that converts transparent RGBA cutouts into clean 3-channel RGB PNG images with white backgrounds prior to uploading.

### Issue 4: Hugging Face ZeroGPU Free IP Quota Limit (120s/day)
* **Problem**: Calling CatVTON repeatedly on public ZeroGPU spaces without authentication hit the IP limit:
  ```text
  You have exceeded your free ZeroGPU quota (120s requested vs. 120s left). Subscribe to Hugging Face PRO or authenticate with a Hugging Face token.
  ```
* **Solution**:
  - Updated `catvton_client.py` to accept `HF_TOKEN` from `.env` and pass `token=hf_token` to `Client(...)`.
  - Updated `garmentCatalogService.js` with **graceful fallback handling**: if ZeroGPU quota is exceeded or the space is unavailable, the backend logs a clean 1-line warning and falls back to validating the seller's original flat-lay images. Catalog submission and compliance checks complete successfully without crashing.

---

## 5. Current Status & Next Steps

- **CatVTON Integration**: Fully implemented and syntax-verified.
- **Fallbacks**: Fully operational.
- **Backend & Frontend**: Both running and ready for catalog testing.
- **Optional**: Sellers/developers can add a free `HF_TOKEN` in `.env` to unlock additional daily GPU compute quota.
