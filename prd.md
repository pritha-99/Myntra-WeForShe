# Simplified Onboarding Platform — Final PRD
### Team Frootloops · Theme 1: The Bharat Opportunity
### An audio-first, tile-based, human-backed onboarding assistant for T2/T3 Myntra sellers

---

## 1. Executive Summary

Myntra's existing seller onboarding (`partners.myntrainfo.com`) is a long, text-heavy, English-oriented multi-step form covering registration, business setup, warehouse, banking, brand, catalog, and legal declaration. It works well for sellers with catalog teams and prior e-commerce experience — it does not work for a first-time, possibly non-literate, regional artisan or manufacturer.

This PRD redesigns that entire journey as a **one-question-per-screen, audio-first, tile-based experience**, backed by two layers of support: an instant, retrieval-grounded "Explain This" assistant, and a simulated Myntra-staffed human support call for anyone who still can't complete it alone. The explicit goal: **a seller with no reading ability and no prior digital experience should be able to register and onboard independently — and if they can't, Myntra's own team finishes it with or for them, live.**

---

## 2. Scope

- **Part 1 — Registration:** Phone → Email → GSTIN verification → Name confirmation → Password.
- **Part 2 — Business & Catalog Setup:** Basic Information → Business Model & Fulfilment → Order Management System → Operational Readiness → Warehouse → Bank → Brand → Category/Sizing → Online Presence → APOB → Declaration & Submit.
- **Out of scope:** Changes to Myntra's actual backend logic, security policy, or approval criteria — this PRD only redesigns the **experience layer** on top of the existing requirements.

---

## 3. Core Design Principles

1. **Audio-first, not audio-optional.** Every question plays aloud automatically on screen load — never gated behind a tap.
2. **One question per screen.** No multi-field pages.
3. **Tiles over typing**, wherever the answer is from a known set — inspired by SBI passbook printing machine kiosks: large, high-contrast, physical-button-style tiles.
4. **Two layers of help, always visible:**
   - **Layer 1 — "Explain This"** (instant, in-screen, LLM-based, retrieval-grounded — never freely generated)
   - **Layer 2 — Human support call** (Myntra-staffed, not a third-party agency; simulated for this hackathon build)
5. **Reorder steps where it reduces real-world errors** — not just replicate the original form order. (E.g., GSTIN verification moved before name entry, since the name must match the GST certificate exactly.)

---

## 4. Full Screen-by-Screen Flow

### Screen 0 — Language Selection
Four tiles in native script: **தமிழ் · తెలుగు · हिंदी · English.** Tapping a tile plays an audio sample of the language name in that language. Persists for the whole session.

---

### PART 1 — REGISTRATION

**Screen 1 — Phone Number.** Numeric keypad. Error: *"Indian mobile numbers have 10 digits — please check and try again."* 2 failed attempts → support surfaces.

**Screen 2 — OTP (Phone).** 6-digit tile keypad, spoken countdown for resend.

**Screen 3 — Organisation Email.** On-screen keyboard + mic dictation (spoken email parsed, e.g. "raman at gmail dot com" → `raman@gmail.com`).

**Screen 4 — OTP (Email).** Same pattern as Screen 2.

**Screen 5 — GSTIN Entry** *(moved earlier by design)*. Alphanumeric tile keypad, real-time structural validation. Explain-this: *"This is the 15-character number on your GST certificate."*

**Screen 6 — Confirm Business Details.** Auto-filled from verified GSTIN (Company Name, PAN, Address, City, State, Pincode) — read aloud, confirmed via "Yes, this is correct" tile. "This is wrong" routes straight to human support.

**Screen 7 — Name Confirmation.** Auto-suggested from GST data, split First/Last Name — solves the "name must match GST certificate" requirement without asking the seller to type it correctly from memory.

**Screen 8 — Password Creation.** Real typed field per team decision, but delivered as a guided 3-step conversation (8+ characters → capital letter → number), each step confirmed live with audio + checkmark before revealing the next.

**Screen 9 — Registration Complete.** Full audio read-back of everything entered, then "Continue to next step."

---

### PART 2 — BUSINESS & CATALOG SETUP

**Section A — Basic Information**
- A1: "Is the primary contact you, or someone else?" — tile shortcut avoids re-asking 3 fields for the common case.
- A2: "Who owns this business?" — same shortcut pattern.
- A3: "Have you sold on Myntra before?" — Yes/No tile.
- A4: Entity Type — auto-filled from GST data, shown as read-back only.
- A5: Signature — "Take a photo" or "Draw signature" (finger canvas), no scanner required.
- A6: TDS/TAN (optional) — Yes/No/"Explain more" tile.

**Section B — Business Model & Fulfilment** *(content grounded in Myntra's Partner documentation — see Section 9)*

- **B2 — Order Management System (OMS)** *(new section, previously missing)*
  - **Question:** "How do you want to manage your stock and orders — using Myntra's own tool, or a paid outside tool?"
  - Two tiles:
    | Tile shown | Real option | Plain explanation |
    |---|---|---|
    | "Use Myntra's free tool" | **M-Direct / Myntra Direct** | Myntra's own order-management system, free of cost, dedicated to managing your Myntra inventory and orders. |
    | "I already use my own software" | **Third-Party API** | Seller-funded — connect an existing tool (e.g. Increff, Browntape, Unicommerce) for centralized inventory/order control across multiple platforms you sell on. |
  - Shared regardless of choice: same commission and logistics charges, same dispute/claims process, forward & reverse order flow stays identical, payments/settlements happen on the same schedule, and reporting/data insights are the same either way. Read aloud as reassurance that this choice doesn't disadvantage them either way.

- **B3 — Operational Readiness Check** *(new informational + self-assessment screen, previously missing)*
  - This is where the real prerequisites for *actually running* a PPMP seller operation surface — and it's a genuine, honest gap for many T2/T3 sellers, so it's treated as a support opportunity, not just a disclosure.
  - **Question, shown as three simple check tiles:** "Do you already have these?"
    1. 📇 **A thermal printer** (for shipping labels & tax invoices)
    2. 🏷️ **Barcode labels** (4×6 inch single labels)
    3. 📡 **A barcode scanner** (for picking & storing items)
  - If a seller taps "No" on any of these, the flow does **not block progress** — instead it surfaces: *"That's okay — many sellers start without this. Myntra can guide you on affordable options.

**Section C — Warehouse Details**
- C1: Pincode (numeric tiles) + auto-filled City/State/Country.
- C2: Full address — voice dictation primary, typed fallback.
- C3: Operating hours — tap a clock-face tile, not a dropdown.
- C4: Contact info — one-tap reuse of business contact from Part 1.
- C5: Daily order capacity — numeric tile keypad, explained as "helps Myntra know how much stock to expect."

**Section D — Bank Details**
- D1: Account holder name — one-tap "Same as my name."
- D2: Account number — numeric tiles, entered twice for confirmation (extra safeguard given the real-world risk of an error here).
- D3: IFSC — alphanumeric tiles, auto-displays matched bank/branch name for visual confirmation.
- D4: Account type — "Savings" / "Current" tiles.
- D5: Cancelled cheque or passbook photo — visual example shown alongside the request.

**Section E — Brand Details**
- E1: Brand name.
- E2: Nature of business — "I make it" / "I only sell it" / "Both" tiles.
- E3: Proof of ownership — Trademark, or (if none) explain-this surfaces NOC/Indemnity Bond alternatives and routes to support for help preparing either.
- E4: MRP, selling price, catalogue width, turnover, years of operation — one numeric question per screen, each with explain-this since terms like "Catalogue Width" aren't self-explanatory.
- E5: Brand USP — voice note, transcribed live, replacing the original "type max 50 words" field.
- E6: "Myntra for Earth" — icon multi-select (🌿 Organic · ♻️ Recycled · 🎨 Natural dye · ❌ None) — a natural fit for handloom/weaving-community sellers.

**Section F — Category & Sizing** *(repeatable pattern — same structure repeats per product category)*
- Add a category (icon tiles: Saree, Kurti, Lungi, Home Textiles, etc.) → Article Type/Price/Catalogue Width (one per screen) → "Add another?" (Yes/No, with "same as before" pre-fill for shared attributes) → Sizing info (Master Category, Gender, Article Type as tiles) tied to that category.
- *This pattern continues identically for however many categories a seller adds — not detailed screen-by-screen further here, per team scoping decision.*

**Section G — Online Presence**
- G1: "Do you already sell this elsewhere — shop, WhatsApp, another app?" Yes/No, with reassurance audio that this doesn't affect approval.

**Section H — APOB (Additional Place of Business)**
- H1: "Do you have more than one business location?" Yes/No — if No, section is skipped entirely (a clarity improvement over the original form, which doesn't make this optional-ness obvious upfront).
- If Yes: same address/pincode/GSTIN pattern as Warehouse Details (Section C), plus contact person details.
- *Same repeatable pattern as Section F applies where multiple locations are added.*

**Section I — Declaration & Submit**
- I1: Full audio read-back of the entire application, section by section, each with a "This is wrong, fix it" shortcut that jumps directly to that screen.
- I2: Declaration text read aloud in full before the "I agree and submit" tile becomes active.
- I3: Submission confirmation, with a proactive "Call me if there's a problem" opt-in.

---

## 5. Support System Specification

### Layer 1 — "Explain This" (instant, in-screen)
- Present on every screen, identical position/icon throughout.
- Seller can ask by voice or by typing, in their chosen language.
- Answers are grounded via retrieval over a Ground Truth Document Store (see Section 8) — the LLM does not answer from general knowledge. If no relevant passage is found, it does not guess — it immediately offers Layer 2.

### Layer 2 — Human Support Call (Myntra-staffed; simulated for this build)
- One-tap call button on every screen.
- For this hackathon, if it is clicked or triggered, a message will appear that it is just a demo. The actual functionality implemented is out of scope for this MVP.
- Resumes exactly where it left off after the call ends.

**Universal escalation rule:** two failed validation attempts on any single field automatically surfaces the human support option — the system does not wait to be asked.

---

## 6. Validation & Error Handling — Summary

| Screen | Failure | What the seller hears/sees |
|---|---|---|
| Phone number | Wrong digit count | "Indian mobile numbers have 10 digits — please check and try again." |
| OTP | Wrong code | "That code didn't match. Check your messages — the newest code is the one that works." |
| Email | Malformed | "This doesn't look like a complete email. It should look like name@example.com." |
| GSTIN | Format/verification failed | "We couldn't verify this GST number. Please check it, or call support and we'll help." |
| GST detail confirmation | Seller flags as wrong | Routes directly to human support — not self-correctable. |
| Password | Requirement not yet met | Step-by-step, one requirement revealed at a time, confirmed live. |
| Warehouse pincode | Not recognized | "We couldn't find that pincode. Please check it, or call support and we'll look it up together." |
| Bank account number | Two entries don't match | "The two numbers you entered don't match. Please type your account number again, carefully." |
| IFSC | Not found | "We couldn't match this code to a bank. Please check your passbook or chequebook and try again." |
| Category/Sizing | No categories added | "Please add at least one type of product you want to sell, so we know what to list for you." |

---

## 7. Technical Implementation

```
Seller Device (mobile web/app)
   │
   ├─ Tile/Voice UI Layer  (one-screen-per-question renderer)
   │
   ├─ STT Engine — voice input → text (multilingual, e.g. Whisper or a cloud STT API)
   │
   ├─ TTS Engine — text → spoken audio
   │      Pre-recorded audio for fixed question text (quality + zero latency);
   │      live TTS reserved for dynamic content (errors, read-backs, explain-this answers)
   │
   ├─ "Explain This" Agent (LLM + RAG)
   │      - Retrieves relevant passage from the Ground Truth Document Store
   │      - Answers ONLY from what's retrieved — never from general knowledge
   │      - No relevant passage found → does not guess, surfaces human support instead
   │
   ├─ Deterministic Validation Layer (NOT the LLM)
   │      - GSTIN pattern, phone digit count, IFSC lookup, pincode lookup,
   │        password rule checks — plain rule-based logic, not LLM judgment
   │
   └─ Session State Store
          - Every answer saved immediately per screen
          - Enables resume-after-interruption and the live "agent view" in Layer 2
```

**Component breakdown — what's LLM-based vs. not:**

| Component | LLM-based? |
|---|---|
| Reading questions aloud | No — pre-recorded/standard TTS |
| Explain-This answers | **Yes** — LLM, grounded via RAG |
| Format validation (GSTIN, phone, password) | No — deterministic rules |
| IFSC → bank name lookup | No — database/API lookup |
| Voice note transcription (e.g. Brand USP) | No — STT only |
| Final read-back summary | Template-filled from collected data, not open-ended generation |
| Support agent's live view | No — direct reflection of session state |

---

## 8. Ground Truth Document Store
Currently available:

Myntra Partner documentation (this PRD's source PDF):**
- PPMP definition, process flow, and payment cycle
- MSA definition and benefits
- OMNI channel description
- M-Direct vs. Third-Party API (OMS) definitions and shared terms
- Cataloging, packaging, and infrastructure prerequisites (thermal printer, barcode labels, barcode scanner)
Doc of terms and conditions
Doc of frequently asked questions



---

## 9. Non-Functional Requirements

- All question/error audio available in all 3 MVP languages (Tamil, Hindi, English).
- Large, kiosk-scale tap targets throughout — SBI passbook machine as the reference interface, not standard mobile UI scale.
- Continuous session saving — no data loss on app close, call interruption, or network drop.
- LLM calls degrade gracefully — if unreachable, immediately offer human support rather than an error with no path forward.



