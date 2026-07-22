# Implementation Plan: Automated Garment On-Model Catalog Generation (v2)

This implementation plan outlines the step-by-step technical architecture for building the **Automated Garment On-Model Catalog Generation** feature into the seller product listing portal, adhering strictly to **PRD v2**.

---

## Technical Architecture Overview

```mermaid
flowchart TD
    A[Seller Uploads Garment Photos] -->|Front Flat-Lay (Req), Back Flat-Lay (Req), Additional (Max 5)| B[Stage 0: Input Validation & Image Prep]
    B -->|Convert to JPEG, Resolution Check (min 400px)| C[Stage 1 & 2: Crop & Background Cutout]
    C -->|BiRefNet / Sharp Mask Cutouts| D[Stage 3: Gemini On-Model Generation (3 Parallel Calls)]
    
    subgraph Parallel Gemini Calls
        D1[Front Call: Cropped Front + Local Front Stock Model] --> R1[On-Model Front Render]
        D2[Back Call: Cropped Back + Local Back Stock Model] --> R2[On-Model Back Render]
        D3[Side Call: Cropped Front + Back + Local Side Stock Model] --> R3[On-Model Side Render]
    end
    
    D --> D1
    D --> D2
    D --> D3
    
    R1 --> E[Stage 4: Rule-based Compliance Validation Engine]
    R2 --> E
    R3 --> E
    B -->|Pass-Through Additional Images (Max 5)| E
    
    E -->|Per-Image Compliance Report| F[Seller Interactive Catalog Review Modal]
    F -->|Approve & Save| G[MongoDB Product Record + Customer Storefront]
```

---

## User Review Required

> [!IMPORTANT]
> **Gemini API Key & Stock Model Assets**:
> 1. Stock model reference pose images (`front_stock.jpg`, `back_stock.jpg`, `side_stock.jpg`) will be included in `everything/backend/src/assets/stock_models/`.
> 2. On-model generation will use the Gemini API (`GEMINI_API_KEY` configured in `everything/backend/.env`).
> 3. Each Gemini generation runs independently in parallel with an 8-second timeout. If one pose fails, the surviving poses are delivered seamlessly (partial delivery).

---

## Proposed Changes

### Backend — `everything/backend`

#### [NEW] [stock_models directory](file:///home/pritha/Desktop/myn/everything/backend/src/assets/stock_models)
* Add high-quality stock model reference pose images (`front_stock.jpg`, `back_stock.jpg`, `side_stock.jpg`) used for Gemini garment compositing.

#### [NEW] [garmentCatalogService.js](file:///home/pritha/Desktop/myn/everything/backend/src/services/garmentCatalogService.js)
* **Stage 0**: Input validation (Required front + back, max 5 additional, min 400px resolution check).
* **Stage 1 & 2**: Garment crop & background removal pipeline using `sharp` mask derivation / background removal.
* **Stage 3**: 3 independent, parallel Gemini 2.5/1.5 Flash image generation calls using `@google/genai` / Gemini REST API with `Promise.allSettled` and per-call timeouts (8s).
* **Stage 4**: Automated compliance checklist engine using `sharp` / pixel sampling:
  * File size check (500KB–1MB target)
  * Dimensions (≥1080×1440, 3:4 ratio)
  * Background neutrality check (sample corner/margin pixels for light grey/white tolerance band)
  * Blur & focus analysis (Laplacian variance sharpness metric)
  * Watermark/text check (lightweight OCR regex scan)
  * Price tag seller self-declaration flag.

#### [MODIFY] [Product.js](file:///home/pritha/Desktop/myn/everything/backend/src/models/Product.js)
* Expand product schema to store structured `garmentCatalog` data:
  * `front`: `{ original, onModel, generationStatus, complianceReport }`
  * `back`: `{ original, onModel, generationStatus, complianceReport }`
  * `side`: `{ onModel, generationStatus, complianceReport }`
  * `additional`: `[{ original, label, complianceReport }]`
  * `priceTagConfirmed`: boolean

#### [MODIFY] [products.js](file:///home/pritha/Desktop/myn/everything/backend/src/routes/products.js)
* Update `POST /api/products` upload route:
  * Configure Multer to accept `frontImage` (required), `backImage` (required), and `additionalImages` (array, max 5).
  * Trigger `garmentCatalogService.processGarmentCatalog(...)`.
  * Save structured `garmentCatalog` to database.

---

### Frontend — `everything/frontend`

#### [MODIFY] [ProductListingPage.jsx](file:///home/pritha/Desktop/myn/everything/frontend/src/dashboard/ProductListingPage.jsx)
* Update upload form UI per PRD v2:
  * Distinct upload slots for **Front Flat-lay Photo (Required)** and **Back Flat-lay Photo (Required)**.
  * Upload dropzone for **Additional Reference Photos (Optional, up to 5)**.
  * Price tag confirmation checkbox ("I confirm no price tags or stickers are visible on garments").
  * **Interactive Pipeline Status**: Real-time progress bar showing Stage 1 (Crop/Cutout) -> Stage 2 (Gemini Multi-View Generation) -> Stage 3 (Compliance Checklist).
  * **Interactive Catalog & Compliance Modal**:
    * Side-by-side view of generated On-Model Front, Side, and Back renders with high-res zoom.
    * Compliance status badge per image (Pass/Warning/Fail).
    * Collapsible per-image compliance checklist breakdown (File size, Dimensions, Aspect ratio, Background color, Blur/Sharpness score).
    * Partial delivery notification if any view was skipped/failed.

---

## Verification Plan

### Automated Tests
1. **Module & Syntax Check**:
   ```bash
   node --check everything/backend/src/services/garmentCatalogService.js
   node --check everything/backend/src/routes/products.js
   ```
2. **Frontend Vite Build**:
   ```bash
   npx vite build --cwd everything/frontend
   ```

### Manual Verification
1. Submit a product listing with Front + Back flat-lay photos and 2 additional fabric detail photos.
2. Verify that 3 parallel Gemini calls run and generate Front, Back, and Side on-model renders.
3. Verify that the per-image compliance checklist correctly evaluates dimensions, background neutrality, file size, and blur metrics.
4. Test edge cases:
   - Upload missing back photo -> Verify clear error ("Back flat-lay photo is required").
   - Upload 6 additional photos -> Verify rejection ("Maximum 5 additional images allowed").
