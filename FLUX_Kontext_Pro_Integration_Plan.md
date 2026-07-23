# FLUX Kontext Pro Integration Plan

*Date: July 23, 2026*

## Overview

This document supersedes the previous CatVTON virtual try-on
implementation. The goal is to replace the on-model generation stage
with **Replicate's FLUX Kontext Pro API** to generate high-quality
on-model images for the Myntra seller onboarding portal.

The previous CatVTON implementation, architecture, configuration,
issues, and fallback behavior are summarized in the project notes and
serve as historical context. fileciteturn0file0

## Objective

After a seller uploads product images:

-   Front view (required)
-   Back view (required)
-   Additional images (optional)

the backend should automatically generate on-model catalog images using
**FLUX Kontext Pro**.

Unlike CatVTON, the implementation will invoke Replicate directly.

## Proposed Workflow

``` text
Seller Upload
    │
    ├── Front View
    ├── Back View
    └── Extra Images
          │
          ▼
Input Validation
          │
          ▼
Replicate FLUX Kontext Pro
          │
          ├── Call 1 → Front garment image
          └── Call 2 → Back garment image
          │
          ▼
Generated On-model Images
          │
          ▼
Compliance Validation
          │
          ▼
Catalog Listing
```

## API Strategy

Only **one image** is sent per Replicate request.

Two independent API calls are executed:

1.  Front garment image → generate model wearing the front view.
2.  Back garment image → generate model wearing the back view.

The calls may execute in parallel.

## Backend Changes

### Remove

-   CatVTON client integration.
-   Hugging Face specific configuration.

### Add

Create a new service such as:

`everything/backend/src/services/replicate_client.py`

Responsibilities:

-   Authenticate using `REPLICATE_API_TOKEN`.
-   Invoke `black-forest-labs/flux-kontext-pro`.
-   Upload the garment image.
-   Supply the virtual try-on prompt.
-   Return generated image URL/file.

Update `garmentCatalogService.js` to:

-   Trigger generation automatically after upload.
-   Launch two Replicate calls (front/back).
-   Store generated outputs.
-   Continue existing compliance validation.
-   Fall back to the original garment image if generation fails.

## Prompt

Use the following prompt for every request:

> The input image contains a garment. Generate a photorealistic
> full-body fashion model wearing the exact garment shown in the input
> image. Preserve every design detail including color, graphics, logos,
> prints, stitching, seams, neckline, sleeve length, cuffs, fabric
> texture, material, fit, and proportions exactly. Do not modify or
> invent any garment details. Create a professional fashion model with a
> natural pose, studio lighting, and a clean white background suitable
> for an e-commerce fashion catalog. Ensure realistic fabric drape,
> folds, wrinkles, and shadows while keeping the garment identical to
> the input.

## Environment Variables

    REPLICATE_API_TOKEN=<token>

## Error Handling

-   Timeout handling.
-   Retry transient API failures.
-   Log Replicate request IDs.
-   Gracefully fall back to seller-uploaded images.
-   Do not block catalog creation if generation fails.

## Benefits

-   Better photorealistic outputs.
-   Simpler hosted API integration.
-   No Hugging Face ZeroGPU quota issues.
-   Lower maintenance than the previous CatVTON pipeline.

## Deliverables

-   Replicate client service
-   Updated garment catalog service
-   Automatic generation after upload
-   Front/back on-model image generation
-   Existing compliance validation retained
-   Existing fallback behavior retained
