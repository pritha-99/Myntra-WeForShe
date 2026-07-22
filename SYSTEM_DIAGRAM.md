# Garment Catalog Generation - System Architecture

## High-Level Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                         SELLER INTERFACE                          │
│                     (ProductListingPage.jsx)                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  📸 Front Flat-Lay Photo (Required)                              │
│  📸 Back Flat-Lay Photo (Required)                               │
│  📷 Additional Photos (Optional, max 5)                           │
│  ☑️  Price Tag Confirmation                                      │
│                                                                   │
│  [Submit Product Listing] ──────────────────────────────────────┐│
└──────────────────────────────────────────────────────────────────┘│
                                                                     │
                                                                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       BACKEND API ENDPOINT                          │
│                  POST /api/products (products.js)                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Receive multipart/form-data                                    │
│  2. Extract: frontImage, backImage, additionalImages[]            │
│  3. Call processGarmentCatalog()                                   │
│                                                                     │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   GARMENT CATALOG SERVICE                           │
│              (garmentCatalogService.js)                            │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ STAGE 0: INPUT VALIDATION                                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ✓ Front image exists?                                             │
│  ✓ Back image exists?                                              │
│  ✓ Additional images ≤ 5?                                          │
│  ✓ All files readable?                                             │
│  ✓ Resolution ≥ 400px?                                             │
│                                                                     │
│  ❌ REJECT ──→ Return error to seller                              │
│  ✅ PASS ──→ Continue to Stage 1                                   │
│                                                                     │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STAGE 1-2: CROP & BACKGROUND REMOVAL (Sharp)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Front Image ──→ [Detect Foreground] ──→ [Crop] ──→ [Remove BG]   │
│                        ↓                                            │
│                  Front Cutout.png                                   │
│                                                                     │
│  Back Image ──→ [Detect Foreground] ──→ [Crop] ──→ [Remove BG]    │
│                        ↓                                            │
│                  Back Cutout.png                                    │
│                                                                     │
│  (Additional images pass through unchanged)                         │
│                                                                     │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STAGE 3: GEMINI ON-MODEL GENERATION (Parallel)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ FRONT CALL (Independent, 8s timeout)                        │  │
│  ├─────────────────────────────────────────────────────────────┤  │
│  │ Input:  Front Cutout + front_stock.jpg                      │  │
│  │ Prompt: "Generate on-model front view..."                   │  │
│  │ Output: onmodel-front-{timestamp}.jpg                       │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ BACK CALL (Independent, 8s timeout)                         │  │
│  ├─────────────────────────────────────────────────────────────┤  │
│  │ Input:  Back Cutout + back_stock.jpg                        │  │
│  │ Prompt: "Generate on-model back view..."                    │  │
│  │ Output: onmodel-back-{timestamp}.jpg                        │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ SIDE CALL (Independent, 8s timeout)                         │  │
│  ├─────────────────────────────────────────────────────────────┤  │
│  │ Input:  Front + Back Cutouts + side_stock.jpg               │  │
│  │ Prompt: "Generate on-model side view..."                    │  │
│  │ Output: onmodel-side-{timestamp}.jpg                        │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Promise.allSettled() → Collect all results                        │
│  Success = image generated                                         │
│  Failed/Timeout = skip that view, continue with others             │
│                                                                     │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STAGE 4: COMPLIANCE VALIDATION (All Images)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  For each image (generated + additional):                          │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Compliance Check                    Status                   │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │ File Size (500KB-1MB)              [pass/warning/fail]      │ │
│  │ Dimensions (≥1080×1440)            [pass/fail]              │ │
│  │ Aspect Ratio (3:4)                 [pass/warning]           │ │
│  │ Format (JPEG)                      [pass/warning]           │ │
│  │ Background (neutral/light)         [pass/warning/fail]      │ │
│  │ Blur (Laplacian variance)          [pass/warning/fail]      │ │
│  │ Watermark (OCR scan)               [warning (best-effort)]  │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  Generate per-image compliance report                              │
│                                                                     │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SAVE TO DATABASE                               │
│                      (Product Model)                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  {                                                                  │
│    sellerId, name, price, category, quantity,                      │
│    images: [onmodel-front, onmodel-back, onmodel-side, ...],      │
│    garmentCatalog: {                                               │
│      front: {                                                      │
│        original: "/uploads/...",                                   │
│        onModel: "/uploads/onmodel-front-...",                      │
│        generationStatus: "success",                                │
│        complianceReport: { fileSize: "pass", ... }                 │
│      },                                                            │
│      back: { ... },                                                │
│      side: { ... },                                                │
│      additional: [ ... ],                                          │
│      priceTagConfirmed: true,                                      │
│      generatedAt: "2026-07-22T..."                                 │
│    }                                                               │
│  }                                                                  │
│                                                                     │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  RETURN TO FRONTEND                                 │
└─────────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 INTERACTIVE CATALOG MODAL                           │
│                  (Seller Review Interface)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ╔═══════════════╦═══════════════╦═══════════════╗                │
│  ║  FRONT VIEW   ║   BACK VIEW   ║   SIDE VIEW   ║                │
│  ║               ║               ║               ║                │
│  ║  [Image]      ║  [Image]      ║  [Image]      ║                │
│  ║               ║               ║               ║                │
│  ║  ✓ Success    ║  ✓ Success    ║  ✓ Success    ║                │
│  ║               ║               ║               ║                │
│  ║  Compliance:  ║  Compliance:  ║  Compliance:  ║                │
│  ║  ✓ File Size  ║  ✓ File Size  ║  ✓ File Size  ║                │
│  ║  ✓ Dimensions ║  ✓ Dimensions ║  ⚠ Dimensions ║                │
│  ║  ✓ Ratio      ║  ✓ Ratio      ║  ✓ Ratio      ║                │
│  ║  ✓ Background ║  ⚠ Background ║  ✓ Background ║                │
│  ║  ✓ Blur       ║  ✓ Blur       ║  ✓ Blur       ║                │
│  ╚═══════════════╩═══════════════╩═══════════════╝                │
│                                                                     │
│  Additional Images (if any):                                       │
│  ┌─────┐ ┌─────┐                                                  │
│  │ [1] │ │ [2] │  ... (with their own compliance)                 │
│  └─────┘ └─────┘                                                  │
│                                                                     │
│  [Close and Save to Marketplace]                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ProductListingPage.jsx                                         │
│  ├─ Form State Management                                       │
│  ├─ File Upload Handlers                                        │
│  ├─ Validation Logic                                            │
│  ├─ API Client Integration                                      │
│  ├─ Catalog Modal                                               │
│  └─ ComplianceChecklist Component                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                          BACKEND                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  products.js (Route)                                            │
│  ├─ Multer Configuration (multi-field)                          │
│  ├─ Request Validation                                          │
│  ├─ Service Integration                                         │
│  └─ Response Formatting                                         │
│                                                                  │
│  garmentCatalogService.js                                       │
│  ├─ validateInput()                                             │
│  ├─ cropAndRemoveBackground()                                   │
│  ├─ generateOnModelImage()                                      │
│  ├─ generateAllOnModelViews()                                   │
│  ├─ validateCompliance()                                        │
│  └─ processGarmentCatalog() (main)                              │
│                                                                  │
│  Product.js (Model)                                             │
│  └─ garmentCatalog Schema                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Gemini API (@google/generative-ai)                             │
│  ├─ Model: gemini-2.0-flash-exp                                 │
│  ├─ Timeout: 8s per call                                        │
│  └─ Error Handling: Independent per call                        │
│                                                                  │
│  Sharp (Image Processing)                                       │
│  ├─ Foreground Detection                                        │
│  ├─ Cropping                                                    │
│  ├─ Background Removal                                          │
│  ├─ Metadata Extraction                                         │
│  ├─ Pixel Sampling                                              │
│  └─ Edge Detection (blur check)                                 │
│                                                                  │
│  MongoDB                                                         │
│  └─ Product Collection                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
Seller Form Data
    ↓
FormData Object
    ├─ sellerId
    ├─ name, price, category, quantity
    ├─ frontImage (File)
    ├─ backImage (File)
    ├─ additionalImages[] (Files)
    └─ priceTagConfirmed (Boolean)
    ↓
HTTP POST → Backend
    ↓
Multer Parsing
    ├─ frontImage → req.files.frontImage[0]
    ├─ backImage → req.files.backImage[0]
    └─ additionalImages → req.files.additionalImages[]
    ↓
processGarmentCatalog()
    ↓
Catalog Object
    ├─ front: { original, onModel, status, compliance }
    ├─ back: { original, onModel, status, compliance }
    ├─ side: { onModel, status, compliance }
    └─ additional: [{ original, label, compliance }]
    ↓
Product Document (MongoDB)
    ↓
HTTP Response → Frontend
    ↓
Catalog Modal (UI)
    ↓
Seller Approval
    ↓
Marketplace Display
```

## Error Flow

```
Error Occurs
    ↓
┌───────────────────────┐
│ Where did it happen?  │
└───────────────────────┘
    ↓
    ├─ Stage 0 (Validation)
    │   └─→ Return 400 with clear error message
    │       └─→ Frontend shows error toast
    │
    ├─ Stage 1-2 (Processing)
    │   └─→ Fallback to original image
    │       └─→ Continue pipeline
    │
    ├─ Stage 3 (Gemini)
    │   └─→ Mark that view as "failed"
    │       └─→ Continue with other views
    │           └─→ Partial delivery
    │
    └─ Stage 4 (Compliance)
        └─→ Mark checks as "unknown"
            └─→ Continue pipeline
                └─→ Show warnings in modal
```

## Timing Diagram

```
Time (seconds)
0s     Seller clicks Submit
       │
0.1s   ├─ Form validation (client-side)
       │
0.2s   ├─ HTTP POST starts
       │
0.5s   ├─ Stage 0: Input validation (backend)
       │
1.0s   ├─ Stage 1-2: Crop & background removal
       │   ├─ Front processing
       │   └─ Back processing (parallel)
       │
2.0s   ├─ Stage 3: Gemini generation (parallel)
       │   ├─ Front call (0-8s) ─────────┐
       │   ├─ Back call (0-8s) ──────────┤ Running in parallel
       │   └─ Side call (0-8s) ──────────┘
       │
9.0s   ├─ Stage 4: Compliance validation
       │   └─ All images checked in sequence
       │
10.0s  ├─ Save to database
       │
10.2s  ├─ HTTP Response
       │
10.3s  └─ Modal opens
```

## File Structure

```
everything/
├── backend/
│   ├── src/
│   │   ├── assets/
│   │   │   └── stock_models/
│   │   │       ├── front_stock.jpg ─────┐
│   │   │       ├── back_stock.jpg ──────┤ Referenced by
│   │   │       └── side_stock.jpg ──────┘ garmentCatalogService
│   │   ├── models/
│   │   │   └── Product.js ──────────────→ garmentCatalog schema
│   │   ├── routes/
│   │   │   └── products.js ─────────────→ Multi-field upload
│   │   └── services/
│   │       └── garmentCatalogService.js → Core pipeline
│   ├── uploads/ ────────────────────────→ Generated images stored here
│   └── test-catalog-service.js ─────────→ Validation test
│
└── frontend/
    └── src/
        └── dashboard/
            └── ProductListingPage.jsx ──→ UI + Modal
```

---

This architecture implements the full PRD v2 specification with proper separation of concerns, error handling, and resilience.
