# Final PRD — Complete Build Plan
### Team Frootloops · Building the remaining flow on top of the already-built template

## 0. Purpose of this document

The template (Build Doc v2) is already built: the manifest-driven `QuestionScreen`, all input components, the validator/doc registries, session store, and the 7 proof-of-concept entries. This document does **not** redesign anything and does **not** require any new components — every remaining screen maps directly onto the existing toolkit. Category & Sizing and APOB are scoped to a single instance each for this phase (no "add another" repeat flow), specifically so the whole remaining build is pure **content authoring**: new manifest entries, validators, and explain-docs, nothing structurally new.

**Non-negotiable goal for every screen below, old or new:** big, clear, and visible. Large tap targets (kiosk-scale, not standard mobile scale), high contrast, audio-first, no small text, no hidden functionality. If a new screen can't be built this way using the existing components, that's a signal to extend the template — not to quietly ship something smaller and harder to see.

**Business model selection (PPMP/MSA/OMNI) is completely removed** — not deferred, not hidden, not referenced anywhere in this flow. Do not reintroduce it in any form.

---

## 1. What's Already Built (recap only — do not rebuild)

- `QuestionScreen.jsx` — generic renderer driven by manifest entries
- Input components: `NumericTile`, `AlphanumericTile`, `TileGroup`, `TileGroupMulti`, `VoiceInput`, `TextInput`, `PhotoCapture`, `GuidedPassword`, `ConfirmReadonly`, `TimePicker`, `DeclarationAgree`
- `sessionStore.js`, `AudioPlayer`, `ProgressBar`, `HelpButton`, `SupportCallButton` (demo modal only), `ErrorMessage`
- Backend: `/api/validate`, `/api/explain`, `/api/lookup/pincode/:id`, `/api/lookup/ifsc/:id`
- Validators built: `phone`, `gstin`, `ifsc`, `password`
- Docs built: `phone_explained`, `gstin_explained`, `oms_explained`, `operational_readiness_explained`, `password_explained`, `ifsc_explained`, `terms_and_conditions`, `faq`
- 7 sample manifest entries proving every input type works end-to-end

---

## 2. New Validators Needed (add to `validators/registry.js`)

| validationType | Used for | Logic |
|---|---|---|
| `email` | Organisation email (Screen 3) | Standard format check — must contain `@` and a domain |
| `otp` | Phone/email OTP screens | 6-digit numeric match against session-issued code |
| `pincode` | Warehouse/APOB pincode | Format check + calls `/api/lookup/pincode/:id` to confirm it resolves |
| `account_number_confirm` | Bank account number (entered twice) | Compares two stored values, not a format check |
| `ifsc` | *(already built)* | reused as-is for Bank Details D3 |
| `non_empty` | Brand name, category names, free-text fields with no stricter rule | Simple presence check |

---

## 3. New Explain-Doc Keys Needed (add to `docs/content/field/`)

`email_explained`, `otp_explained`, `pincode_explained`, `account_number_explained`, `tds_explained`, `catalogue_width_explained`, `myntra_for_earth_explained`, `apob_explained`, `nature_of_business_explained`, `trademark_proof_explained`. Each follows the existing pattern — a short, plain-language `{ en, ta, hi }` object, written in the same voice as the docs already built.

---

## 4. Full Remaining Manifest — Organized by Section

Every row below maps directly onto an **already-built** input component. Question text shown here is English only for build reference — `ta`/`hi` translations are a separate content pass, tracked the same way as the original 7 entries.

### Part 1 — Registration (remaining entries)

| id | inputType | validationType | explainDocKey | Question (EN) |
|---|---|---|---|---|
| `otp_phone` | `numeric_tile` | `otp` | `otp_explained` | "Enter the code we sent to your phone." |
| `email` | `text_input` | `email` | `email_explained` | "What is your business email address?" |
| `otp_email` | `numeric_tile` | `otp` | `otp_explained` | "Enter the code we sent to your email." |
| `confirm_business_details` | `confirm_readonly` | — | — | "Here's what we found — is this correct?" *(auto-filled from GSTIN lookup)* |
| `confirm_name` | `text_input` (pre-filled) | `non_empty` | — | "Is this your name as the business owner?" |
| `registration_complete` | `declaration_agree`-style read-back *(reuse component, no "agree" gate needed — see note)* | — | — | Full audio summary of Part 1 answers |

*Note on `registration_complete`:* reuse `DeclarationAgree`'s "play full text aloud" behavior, but skip the disabled-until-played gating logic — it's a summary screen, not a legal agreement. Simplest approach: add `inputConfig.requireFullPlayback: false` to distinguish it from the real Declaration screen (I1/I2) without a new component.

### Part 2 — Section A: Basic Information

| id | inputType | validationType | explainDocKey | Question (EN) |
|---|---|---|---|---|
| `primary_contact_is_owner` | `tile_group` (Yes/No) | — | — | "Is the primary contact for your business you, or someone else?" |
| `business_owner_is_registrant` | `tile_group` (Yes/No) | — | — | "Who owns this business — is it you?" |
| `existing_myntra_partner` | `tile_group` (Yes/No) | — | — | "Have you sold on Myntra before, under a different account?" |
| `entity_type_confirm` | `confirm_readonly` | — | — | *(auto-filled from GST data)* |
| `signature` | `photo_capture` *(reuse as-is, photo mode)* | `non_empty` | — | "Please take a photo of your signature on paper." |
| `tds_optional` | `tile_group` (Yes/No/Explain more) | — | `tds_explained` | "Do you want to claim TDS benefits? This is optional." |

### Part 2 — Section C: Warehouse Details

| id | inputType | validationType | explainDocKey | Question (EN) |
|---|---|---|---|---|
| `warehouse_pincode` | `numeric_tile` | `pincode` | `pincode_explained` | "What is the pincode of your shipping location?" |
| `warehouse_address` | `voice_input` (+ text fallback) | `non_empty` | — | "What is the full address of this location?" |
| `warehouse_hours` | `time_picker` | — | — | "What time do you start and stop packing orders each day?" |
| `warehouse_contact` | `text_input` (pre-fill option) | `email` / `phone` | — | "What phone and email should Myntra use for pickup coordination?" |
| `warehouse_capacity` | `numeric_tile` | — | — | "How many orders can you pack and ship in one day?" |

### Part 2 — Section D: Bank Details

| id | inputType | validationType | explainDocKey | Question (EN) |
|---|---|---|---|---|
| `bank_account_holder` | `text_input` (pre-fill "same as my name") | `non_empty` | — | "What name is on your bank account?" |
| `bank_account_number` | `numeric_tile` ×2 (entered twice) | `account_number_confirm` | `account_number_explained` | "What is your account number? Please enter it again to confirm." |
| `bank_ifsc` | `alphanumeric_tile` | `ifsc` *(already built)* | `ifsc_explained` *(already built)* | "What is your bank branch's IFSC code?" |
| `bank_account_type` | `tile_group` (Savings/Current) | — | — | "What type of account is this?" |
| `bank_cheque_photo` | `photo_capture` (photo mode only) | `non_empty` | — | "Please take a photo of a cancelled cheque, or your passbook's first page." |

### Part 2 — Section E: Brand Details

| id | inputType | validationType | explainDocKey | Question (EN) |
|---|---|---|---|---|
| `brand_name` | `text_input` (+ mic) | `non_empty` | — | "What is your brand name?" |
| `nature_of_business` | `tile_group` | — | `nature_of_business_explained` | "Do you make the product, only sell it, or both?" |
| `trademark_proof` | `tile_group` (Yes/No) → `photo_capture` if Yes | — | `trademark_proof_explained` | "Do you have a Trademark certificate for your brand?" |
| `brand_mrp` | `numeric_tile` | — | — | "What is the average MRP of your products?" |
| `brand_selling_price` | `numeric_tile` | — | — | "What is your average selling price?" |
| `brand_catalogue_width` | `numeric_tile` | — | `catalogue_width_explained` | "How many different designs do you plan to list?" |
| `brand_monthly_turnover` | `numeric_tile` | — | — | "What is your average monthly business turnover?" |
| `brand_years_operating` | `numeric_tile` | — | — | "How many years have you been running this business?" |
| `brand_usp` | *(already built — reuse as-is)* | — | — | — |
| `myntra_for_earth` | `tile_group_multi` | — | `myntra_for_earth_explained` | "Is your product made in an eco-friendly way?" |

### Part 2 — Section F: Category & Sizing *(single category for now — no repeat/"add another" flow)*

| id | inputType | validationType | explainDocKey | Question (EN) |
|---|---|---|---|---|
| `category_type` | `tile_group` (icon tiles) | `non_empty` | — | "What type of product do you want to list?" |
| `category_article_type` | `tile_group` or `text_input` | — | — | "What specific article type is this?" |
| `category_avg_price` | `numeric_tile` | — | — | "What's the average selling price for this?" |
| `sizing_master_category` | `tile_group` | — | — | "What category is this for sizing?" |
| `sizing_gender` | `tile_group` | — | — | "Who is this product for?" |

*Note:* the seller lists one product category per this build phase. Supporting multiple categories ("add another") is a future extension, not part of this pass.

### Part 2 — Section G: Online Presence

| id | inputType | validationType | explainDocKey | Question (EN) |
|---|---|---|---|---|
| `sells_elsewhere` | `tile_group` (Yes/No) | — | — | "Do you already sell this elsewhere — your own shop, WhatsApp, another app?" |

### Part 2 — Section H: APOB *(single additional location for now — reuses Section C's components exactly)*

| id | inputType | validationType | explainDocKey | Question (EN) |
|---|---|---|---|---|
| `apob_needed` | `tile_group` (Yes/No) | — | `apob_explained` | "Do you have another business location?" |
| `apob_address` | *(reuse `warehouse_address`)* | `non_empty` | — | "What is the address of this location?" |
| `apob_pincode` | *(reuse `warehouse_pincode`)* | `pincode` | `pincode_explained` | "What is the pincode?" |
| `apob_gstin` | *(reuse `gstin` component/validator)* | `gstin` | `gstin_explained` | "What is the GSTIN for this location?" |
| `apob_contact` | *(reuse `warehouse_contact`)* | `email` / `phone` | — | "Who should Myntra contact for this location?" |

*Note:* if `apob_needed` is "No," the remaining four screens are skipped entirely — this is a simple conditional skip, not a repeat/loop, so it needs no new flow logic beyond what `QuestionScreen` already supports (skipping forward based on a prior answer).

### Part 2 — Section I: Declaration & Submit *(I2 already built)*

| id | inputType | validationType | explainDocKey | Question (EN) |
|---|---|---|---|---|
| `full_readback` | reuse `registration_complete` pattern (see Part 1 note) | — | — | Full audio summary of the entire application, with a "fix this" shortcut per section |
| `declaration` | *(already built — `declaration_agree`)* | — | `terms_and_conditions` | — |
| `submission_confirmation` | new lightweight confirmation screen — reuse `ConfirmReadonly`'s display pattern, no input needed | — | — | "Your application has been submitted." + "Call me if there's a problem" opt-in tile |

---

## 5. Accessibility Checklist — Apply to Every Entry Above

- [ ] Tap targets are kiosk-scale (large enough to hit without precision — no small icons or thin dropdown arrows)
- [ ] Every question's audio autoplays on screen load, no exceptions
- [ ] Every tile shows an icon or image where the concept allows it, not text-only
- [ ] Every screen has the Help button and Support Call button in the same fixed position as the other 7 proven screens
- [ ] Error messages are specific and audio-paired, never a generic "invalid input" with no fix suggested
- [ ] No screen requires reading more than one short sentence to understand what to do

---

## 6. Definition of Done for This Phase

- [ ] All 6 new validators added to the registry and unit-tested independently
- [ ] All 10 new explain-docs written and returning grounded answers
- [ ] Every manifest entry in Section 4 above exists in `manifest.json`, in the correct order, referencing only already-built input components — no new components required for this phase
- [ ] Full flow — Language select → Part 1 → Part 2 (one category, one optional APOB location) → Declaration → Submission confirmation — runs start to finish without any placeholder screens
- [ ] No trace of business model selection (PPMP/MSA/OMNI) anywhere in the manifest, docs, or UI
- [ ] No repeat/"add another" logic anywhere in this phase — single-instance only for Category and APOB, confirmed by checking the flow can't loop back into either section
