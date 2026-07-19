# Build Doc v2 — Reusable Onboarding Question Template
### Team Frootloops · For build execution (e.g. Antigravity)
### Reflects the updated PRD: Business Model screen removed, 3 languages, Layer 2 support simplified to a demo modal, new general-reference grounding docs (T&Cs, FAQ)


## 1. What to Build (and What Not To)

Build **one reusable template system** — a frontend component that renders any onboarding question from a config entry, and a backend that validates/explains any field from a registry — proven out with **7 sample questions** covering every input type currently in use.

**In scope:** the template engine, the manifest schema, the registries, 7 working sample screens end-to-end, the demo-modal support button.
**Out of scope:** the remaining ~30 real manifest entries (content-authoring, done by the team after this template is proven), real STT/TTS vendor integration (browser-native stub with a swappable interface), real LLM-based free-form reasoning (direct doc lookup stands in), real telephony or any live human-agent view (permanently out of scope for this MVP, not just deferred — see Section 4.3).

---

## 2. Tech Stack

- **Frontend:** React + Vite, Tailwind CSS
- **Backend:** Node.js + Express
- **State:** in-memory + `localStorage`, no database
- **Language:** JavaScript (not TypeScript)

---

## 3. Folder Structure

```
bharat-onboarding/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── QuestionScreen.jsx
│   │   │   ├── inputs/
│   │   │   │   ├── NumericTile.jsx
│   │   │   │   ├── AlphanumericTile.jsx
│   │   │   │   ├── TileGroup.jsx
│   │   │   │   ├── TileGroupMulti.jsx
│   │   │   │   ├── VoiceInput.jsx
│   │   │   │   ├── TextInput.jsx
│   │   │   │   ├── PhotoCapture.jsx
│   │   │   │   ├── GuidedPassword.jsx
│   │   │   │   ├── ConfirmReadonly.jsx
│   │   │   │   ├── TimePicker.jsx
│   │   │   │   └── DeclarationAgree.jsx        # NEW — see 4.7
│   │   │   ├── AudioPlayer.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── HelpButton.jsx
│   │   │   ├── SupportCallButton.jsx           # SIMPLIFIED — modal only, see 4.3
│   │   │   └── ErrorMessage.jsx
│   │   ├── data/
│   │   │   └── manifest.sample.json
│   │   ├── state/
│   │   │   └── sessionStore.js
│   │   ├── i18n/
│   │   │   ├── en.json
│   │   │   ├── ta.json
│   │   │   └── hi.json                          # Telugu removed
│   │   ├── api/
│   │   │   ├── client.js
│   │   │   ├── sttProvider.js
│   │   │   └── ttsProvider.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── validate.js
│   │   │   ├── explain.js
│   │   │   └── lookup.js
│   │   ├── validators/
│   │   │   ├── registry.js
│   │   │   ├── phone.js
│   │   │   ├── gstin.js
│   │   │   ├── ifsc.js
│   │   │   └── password.js
│   │   ├── docs/
│   │   │   ├── registry.js
│   │   │   └── content/
│   │   │       ├── field/                        # field-specific explain-this docs
│   │   │       │   ├── phone_explained.js
│   │   │       │   ├── gstin_explained.js
│   │   │       │   ├── oms_explained.js          # replaces business_model_explained.js
│   │   │       │   ├── operational_readiness_explained.js
│   │   │       │   ├── password_explained.js
│   │   │       │   └── ifsc_explained.js
│   │   │       └── general/                      # NEW — not tied to one field
│   │   │           ├── terms_and_conditions.js
│   │   │           └── faq.js
│   │   └── server.js
│   └── package.json
│
└── README.md
```

**Note:** no `support-dashboard/` folder in this build — it's been removed entirely per the PRD update. Do not scaffold it.

---

## 4. Core Data Contracts

### 4.1 Manifest Entry Schema
```json
{
  "id": "gstin",
  "section": "registration",
  "order": 5,
  "questionText": {
    "en": "What is your GST number?",
    "ta": "உங்கள் ஜிஎஸ்டி எண் என்ன?",
    "hi": "आपका जीएसटी नंबर क्या है?"
  },
  "inputType": "alphanumeric_tile",
  "inputConfig": { "length": 15 },
  "validationType": "gstin",
  "explainDocKey": "gstin_explained",
  "required": true
}
```
Only three language keys now: `en`, `ta`, `hi`. Do not include `te`.

**Recognized `inputType` values:**

| inputType | Component | Used for |
|---|---|---|
| `numeric_tile` | NumericTile | phone, OTP, price, stock, pincode, account number, order capacity |
| `alphanumeric_tile` | AlphanumericTile | GSTIN, IFSC |
| `tile_group` | TileGroup | single-select — OMS choice, account type, yes/no, category/fabric/colour |
| `tile_group_multi` | TileGroupMulti | multi-select — Operational Readiness checklist, Myntra for Earth tags |
| `voice_input` | VoiceInput | free-text description, USP |
| `text_input` | TextInput | email, address |
| `photo_capture` | PhotoCapture | signature, cancelled cheque/passbook |
| `guided_password` | GuidedPassword | password screen only |
| `confirm_readonly` | ConfirmReadonly | GST-verified detail confirmation, entity type |
| `time_picker` | TimePicker | warehouse operating hours |
| `declaration_agree` | DeclarationAgree | **NEW** — final declaration screen, see 4.7 |

**Explicitly removed:** there is no business-model tile-group screen or entry in this build. If a teammate later reintroduces one, it would just be a new `tile_group` manifest entry — the template already supports it structurally — but it is not part of this scope and should not be built now.

### 4.2 Session State Schema
```json
{
  "language": "ta",
  "currentIndex": 4,
  "answers": { "phone": "9xxxxxxxxx" },
  "errors": { "gstin": "format_invalid" },
  "failedAttempts": { "gstin": 1 }
}
```
Same as before — `state/sessionStore.js` exposes `getState()`, `setAnswer()`, `setError()`, `incrementFailedAttempts()`, `resetFailedAttempts()`, backed by `localStorage`.

### 4.3 Support Call — Simplified Behavior (replaces the v1 dashboard design)
`SupportCallButton.jsx`: always visible, fixed position, consistent icon on every screen. On tap:
1. Opens a modal: *"Connecting you to Myntra support... this is a demo — in the full product, a real support agent would join here and could see your progress so far."*
2. A "Close" tile dismisses the modal.
3. The seller lands back on the exact same screen, with all prior answers untouched — since `sessionStore` was never cleared, this requires no special "resume" logic beyond simply closing the modal.

**Do not build:** any live session-state broadcast, a second app/route showing an agent's view, or any real call/telephony integration. This was explicitly cut from scope.

### 4.4 Backend API Contracts (unchanged shape from v1)

**`POST /api/validate`**
```
Request:  { "validationType": "gstin", "value": "..." }
Response: { "valid": false, "message": "...", "data": null }
```

**`POST /api/explain`**
```
Request:  { "explainDocKey": "gstin_explained", "language": "ta", "question": "optional" }
Response: { "answer": "text", "grounded": true }
```
`explainDocKey` can reference either a **field-specific** doc (`docs/content/field/`) or a **general** doc (`docs/content/general/`) — both live in the same flat registry keyed by string, so the route logic doesn't need to know or care which folder a doc came from. `grounded: false` triggers the same "let's get you a person" UI path as a failed validation, per the original design.

**`GET /api/lookup/pincode/:pincode`** → `{ "city", "state", "country" }`
**`GET /api/lookup/ifsc/:code`** → `{ "bankName", "branch" }`

---

## 5. Frontend Template Behavior Spec

### 5.1 `QuestionScreen.jsx`
Unchanged core logic from v1:
1. Autoplay `questionText[currentLanguage]` audio on mount.
2. Render `<ProgressBar>`.
3. Render input component matching `entry.inputType`.
4. On submit → `POST /api/validate` → advance on valid, show `<ErrorMessage>` + increment `failedAttempts` on invalid.
5. `failedAttempts[entry.id] >= 2` → prominently surface `<SupportCallButton>` (which now just opens the demo modal, per 4.3).
6. `<HelpButton>` and `<SupportCallButton>` always rendered in the same fixed position.

### 5.2 `HelpButton.jsx`
Unchanged — sends `{ explainDocKey, language, question }` to `/api/explain`, plays the answer via the TTS stub. `grounded: false` → same escalation path as 4.3.

### 5.3 New: `DeclarationAgree.jsx`
For the final Declaration screen (PRD Section I2). Props: `entry` with `explainDocKey: "terms_and_conditions"`.
- Displays the full declaration/terms text.
- Plays the full audio automatically on mount (this text is long, so unlike other screens, playback completing is tracked).
- The "I agree and submit" tile is **disabled until the audio has played through at least once** — mirrors the PRD requirement that a seller shouldn't declare something they couldn't understand.
- A visible replay button remains available throughout.

### 5.4 Tile/Voice/Photo/Password/Confirm/Time components
Unchanged from v1 — same behavior specs apply (see prior build doc if needed for reference): `TileGroup`/`TileGroupMulti` read `entry.inputConfig.options`; `GuidedPassword` reveals requirements one at a time; `VoiceInput` uses the STT stub with live transcript; `ConfirmReadonly` shows key/value pairs with correct/wrong tiles; `TimePicker` is a tappable clock face, not a dropdown.

### 5.5 Provider Interfaces (unchanged)
- `api/sttProvider.js` → `transcribe(audioBlob, language) → Promise<string>`, stubbed via browser `SpeechRecognition`.
- `api/ttsProvider.js` → `speak(text, language) → void`, stubbed via browser `speechSynthesis`.

---

## 6. Backend Template Behavior Spec

### 6.1 `validators/registry.js` — unchanged pattern
```js
module.exports = {
  phone: require('./phone'),
  gstin: require('./gstin'),
  ifsc: require('./ifsc'),
  password: require('./password'),
};
```

### 6.2 `docs/registry.js` — now aggregates two folders
```js
const field = {
  phone_explained: require('./content/field/phone_explained'),
  gstin_explained: require('./content/field/gstin_explained'),
  oms_explained: require('./content/field/oms_explained'),
  operational_readiness_explained: require('./content/field/operational_readiness_explained'),
  password_explained: require('./content/field/password_explained'),
  ifsc_explained: require('./content/field/ifsc_explained'),
};
const general = {
  terms_and_conditions: require('./content/general/terms_and_conditions'),
  faq: require('./content/general/faq'),
};
module.exports = { ...field, ...general };
```
Each content file exports `{ en: "...", ta: "...", hi: "..." }`. `routes/explain.js` does a single flat lookup by key — it does not need separate logic for field vs. general docs.

### 6.3 `routes/lookup.js` — unchanged, hardcoded sample values documented in README for this build phase.

---

## 7. Sample Manifest — Build These 7 Entries

| # | id | inputType | validationType | explainDocKey | Demonstrates |
|---|---|---|---|---|---|
| 1 | `phone` | `numeric_tile` | `phone` | `phone_explained` | numeric tile keypad |
| 2 | `gstin` | `alphanumeric_tile` | `gstin` | `gstin_explained` | alphanumeric tile + real-time validation |
| 3 | `oms_choice` | `tile_group` | none (selection only) | `oms_explained` | single-select tile group *(replaces the removed business-model screen as the tile_group example)* |
| 4 | `operational_readiness` | `tile_group_multi` | none | `operational_readiness_explained` | multi-select checklist |
| 5 | `password` | `guided_password` | `password` | `password_explained` | special step-by-step component |
| 6 | `brand_usp` | `voice_input` | none (non-empty check) | — | voice capture + live transcription |
| 7 | `declaration` | `declaration_agree` | none | `terms_and_conditions` | **new** — long-form read-aloud + gated agreement |

This set now covers every `inputType` in the enum at least once, without any reference to the removed business-model screen, and demonstrates the new general-doc lookup via the Declaration entry.

---

## 8. Definition of Done

- [ ] `npm run dev` in both `frontend/` and `backend/` boots a working app
- [ ] All 7 sample entries render in order, each with autoplay audio, a working input, and real backend validation where applicable
- [ ] Failing a field twice auto-surfaces the support modal (per 4.3 — modal only, no dashboard)
- [ ] Tapping Help on any of the 7 screens calls `/api/explain` and returns a grounded answer
- [ ] The Declaration screen's "I agree" tile stays disabled until its audio has played at least once
- [ ] Only 3 languages exist anywhere in the codebase — `en`, `ta`, `hi` — confirm no `te` references remain
- [ ] Adding an 8th manifest entry (any type already in the enum) requires zero component changes — only a new manifest entry and, if needed, one new validator/doc registry line
- [ ] No `support-dashboard` folder, `/support-view` route, or live session broadcasting exists anywhere in the codebase

---

## 9. Explicitly Not Included

- The remaining ~30 real manifest entries (Sections A, C–H) — content-authoring work for the team after this template is proven
- Real STT/TTS vendor integration — browser-native APIs stand in
- Real LLM-based free-form reasoning — direct doc lookup stands in
- **Any live human-agent support view or real telephony — this is now a permanent scope cut for the MVP, not a later upgrade path.** The demo modal is the final intended behavior for this hackathon build, not a placeholder for something bigger to be wired in later.
- Authentication/security
