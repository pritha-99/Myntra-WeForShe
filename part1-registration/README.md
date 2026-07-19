# Bharat Onboarding — Hackathon Prototype

> **Audio-first, tile-based onboarding template for first-time, low-literacy Myntra sellers in Tier 2/3 India.**  
> Team Frootloops · Build Doc v2

---

## What's in Here

| Folder | Purpose |
|--------|---------|
| `frontend/` | React + Vite + Tailwind — the onboarding UI |
| `backend/`  | Node.js + Express — validate / explain / lookup APIs |

---

## Quick Start

### 1. Backend

```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
# Proxies /api/* → http://localhost:4000
```

Open **http://localhost:5173** in a modern browser. Use the language buttons in the header to switch between English / Tamil / Hindi.

---

## Architecture Overview

```
manifest.sample.json     ← 7 sample questions driving the entire UI
         │
         ▼
   App.jsx (routing)
         │
         ▼
QuestionScreen.jsx       ← generic renderer, zero hardcoded content
         │
         ├── inputs/NumericTile.jsx       (phone, pincode, ...)
         ├── inputs/AlphanumericTile.jsx  (GSTIN, IFSC)
         ├── inputs/TileGroup.jsx         (single-select)
         ├── inputs/TileGroupMulti.jsx    (multi-select checklist)
         ├── inputs/VoiceInput.jsx        (STT capture)
         ├── inputs/TextInput.jsx         (email, address)
         ├── inputs/PhotoCapture.jsx      (document photos)
         ├── inputs/GuidedPassword.jsx    (step-by-step password)
         ├── inputs/ConfirmReadonly.jsx   (verified data confirmation)
         ├── inputs/TimePicker.jsx        (warehouse hours)
         └── inputs/DeclarationAgree.jsx  (T&C gated by audio playback)
```

---

## Backend API

### `POST /api/validate`
```json
// Request
{ "validationType": "gstin", "value": "29ABCDE1234F1Z5" }

// Response (valid)
{ "valid": true, "message": "Valid GSTIN.", "data": { "cleaned": "29ABCDE1234F1Z5" } }

// Response (invalid)
{ "valid": false, "message": "GSTIN must be exactly 15 characters.", "data": null }
```

Supported `validationType` values: `phone` | `gstin` | `ifsc` | `password`

### `POST /api/explain`
```json
// Request
{ "explainDocKey": "gstin_explained", "language": "ta", "question": "" }

// Response
{ "answer": "GSTIN என்பது சரக்கு மற்றும் சேவை வரி...", "grounded": true }
```

Supported `explainDocKey` values:
- **Field docs:** `phone_explained`, `gstin_explained`, `oms_explained`, `operational_readiness_explained`, `password_explained`, `ifsc_explained`
- **General docs:** `terms_and_conditions`, `faq`

### `GET /api/lookup/pincode/:pincode`
```json
// GET /api/lookup/pincode/560001
{ "city": "Bengaluru", "state": "Karnataka", "country": "India" }
```

### `GET /api/lookup/ifsc/:code`
```json
// GET /api/lookup/ifsc/SBIN0001234
{ "bankName": "State Bank of India", "branch": "MG Road Bengaluru" }
```

---

## Hardcoded Sample Values (Prototype Phase)

> Real implementation would call India Post / RBI APIs.

### Pincode Lookup
| Pincode | City | State |
|---------|------|-------|
| `560001` | Bengaluru | Karnataka |
| `400001` | Mumbai | Maharashtra |
| `110001` | New Delhi | Delhi |
| `600001` | Chennai | Tamil Nadu |
| `500001` | Hyderabad | Telangana |
| `302001` | Jaipur | Rajasthan |

### IFSC Lookup
| Code | Bank | Branch |
|------|------|--------|
| `SBIN0001234` | State Bank of India | MG Road Bengaluru |
| `HDFC0000001` | HDFC Bank | Fort Mumbai |
| `ICIC0000001` | ICICI Bank | Bandra Mumbai |
| `KKBK0000001` | Kotak Mahindra Bank | Chennai Branch |
| `PUNB0001000` | Punjab National Bank | Connaught Place New Delhi |

### Valid GSTIN for Testing
- `29ABCDE1234F1Z5` — valid format
- Any 15-char code matching regex `^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`

### Valid Phone for Testing
- Any 10-digit number starting with 6–9, e.g. `9876543210`

---

## Adding an 8th Manifest Entry

This requires **zero component changes**:

1. Add a JSON object to `frontend/src/data/manifest.sample.json`
2. If it uses a new `validationType`, add one file to `backend/src/validators/` and one line to `backend/src/validators/registry.js`
3. If it needs a help doc, add one file to `backend/src/docs/content/field/` and one line to `backend/src/docs/registry.js`

---

## STT / TTS Swapping

Both providers are isolated in `frontend/src/api/`:
- `sttProvider.js` — swap `transcribe()` to call your vendor API
- `ttsProvider.js` — swap `speak()` to call your vendor API

No component files need to change.

---

## Explicitly Out of Scope

- ❌ No `support-dashboard/` folder anywhere
- ❌ No `/support-view` route
- ❌ No live session broadcasting
- ❌ No Telugu (`te`) language file
- ❌ No business-model screen (removed per PRD update)
- ❌ No real telephony

---

## Languages

Only 3 language files exist: `en.json`, `ta.json`, `hi.json` — under `frontend/src/i18n/`.
