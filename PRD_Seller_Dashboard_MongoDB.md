# PRD: Seller Data Persistence (MongoDB) + Seller Dashboard

**Project:** Bharat Onboarding Prototype
**Doc owner:** Riddhi
**Status:** Draft v1
**Last updated:** July 21, 2026

---

## 1. Background

The Bharat Onboarding prototype currently collects seller answers (registration details, GSTIN, IFSC, password, etc.) via a manifest-driven `QuestionScreen.jsx` flow and persists progress client-side using `sessionStore.js` (LocalStorage). There is no backend persistence, and once onboarding is "complete" there is no post-submission experience — the flow simply ends.

This PRD covers two connected additions:

1. **Backend persistence** — store submitted seller data in MongoDB instead of (or in addition to) LocalStorage.
2. **Post-onboarding Seller Dashboard** — a lightweight, demo-scope Partner Portal–style dashboard (modeled on the attached screenshot) that a seller lands on after submitting onboarding, with one functional module (Product Listing) and placeholder pages for everything else, plus the same help bot and language support already built for onboarding.

This is a **demo/prototype scope** — no authentication, no production-grade security hardening, no real India Post/RBI integrations.

---

## 2. Goals

- Persist seller onboarding submissions durably in MongoDB.
- Give the seller a clear "what happens next" moment after submission.
- Provide a navigable dashboard shell that visually matches Myntra's real Partner Portal, signaling the scope of the eventual full product.
- Make **Product Listing** a real, working feature (create + view listings) tied to the seller's MongoDB record.
- Carry over the onboarding portal's accessibility investments (trilingual UI, TTS/STT, AI help bot) into the dashboard so the experience feels consistent, not just the intake form.

### Non-goals
- No login/authentication (session/localStorage only, per demo scope).
- No real order management, payments, inventory sync, ads, or analytics — these are placeholder pages only.
- No production security review (encryption at rest, PII compliance, rate limiting) — flagged as future work, not blocking for demo.

---

## 3. User Flow

```
Onboarding (existing) → [Submit button clicked]
        ↓
"Myntra will get back to you in a few days" confirmation screen
        ↓
Link: "Go to seller dashboard"
        ↓
Seller Dashboard (Home)
    ├── Home (landing, screenshot-style)
    ├── Product Listing (functional)
    │      ├── Listing form (add product)
    │      └── Listing table/grid (view submitted products)
    └── All other nav tabs → "Coming Soon" placeholder page
```

---

## 4. Feature 1: MongoDB Persistence

### 4.1 What gets stored
- Full seller onboarding submission: every manifest-driven answer keyed by field ID (e.g., business name, phone, GSTIN, IFSC, pincode, password — see note on password below), plus:
  - `language` selected (`en` / `ta` / `hi`)
  - `submittedAt` timestamp
  - `sellerId` (generated on submit, used to route to dashboard and scope product listings)

### 4.2 Proposed collections
- `sellers`
  - `_id` (ObjectId)
  - `sellerId` (string, human-friendly / used in URLs and localStorage — e.g. `SLR-xxxxxx`)
  - `answers` (object — mirrors `manifest.sample.json` field keys, so the manifest-driven approach stays intact)
  - `language`
  - `status` (`submitted` for now; future: `under_review`, `approved`, etc.)
  - `createdAt`, `updatedAt`
- `products`
  - `_id` (ObjectId)
  - `sellerId` (reference to `sellers.sellerId`)
  - `name`, `price`, `category`, `quantity`
  - `images` (array of stored file paths/URLs)
  - `createdAt`, `updatedAt`

### 4.3 API changes
- New `/api/seller/submit` (POST) — replaces/augments current onboarding submit handler; writes to `sellers` collection; returns `sellerId`.
- New `/api/seller/:sellerId` (GET) — fetch a seller record (used by dashboard to greet seller by business name, similar to "Hello BGRSI!" in the screenshot).
- New `/api/products` (POST) — create a product listing.
- New `/api/products/:sellerId` (GET) — list all products for a seller.
- Existing `/api/validate`, `/api/explain`, `/api/lookup/*` endpoints are unaffected.

### 4.4 Frontend/session changes
- On successful submit, store `sellerId` in LocalStorage (`sessionStore.js`) so the dashboard can identify "who's logged in" without a real auth system.
- `sessionStore.js` continues to hold in-progress onboarding answers, but the **submitted** record of truth moves to MongoDB.

### 4.5 Tech notes
- Use MongoDB Atlas (or local MongoDB via Docker for dev) with Mongoose (or native driver) in the existing Node/Express backend.
- Image uploads for Product Listing: store as files (local `/uploads` folder or Atlas-adjacent object storage for demo) with the path saved in the `products` document — no need for a production CDN at this stage.

---

## 5. Feature 2: Post-Submission Confirmation Screen

- Triggered immediately after the existing "Submit" button on the final onboarding step.
- Copy: **"Myntra will get back to you in a few days."**
- Below the message, a link: **"Go to seller dashboard"** → routes to `/dashboard`.
- Screen should follow existing multilingual pattern (translated string in `en`/`ta`/`hi`) and support the same TTS read-aloud convention used elsewhere in onboarding (voluntary "Listen" option, not gated).

---

## 6. Feature 3: Seller Dashboard

### 6.1 Landing screen (Home)
Modeled on the attached Partner Portal screenshot:
- Top nav bar with Myntra Partner Portal branding and tabs: Home, Buying & Inventory, Catalog, Orders & Returns, Growth, Pricing/Promo & Ads, Payment, Business Health, Reports, Support.
- **Home** is the only tab that renders real dashboard content; it should include:
  - Greeting card: "Hello [Business Name]!" pulled from the seller's MongoDB record (`answers.businessName` or equivalent), mirroring "Hello BGRSI!" / "BLJP TECHNOLOGIES PRIVATE LIMITED" in the screenshot.
  - A simple "Useful Links" panel (can be static/demo links).
  - Optional: a banner/announcement block (can be static demo content, no CMS needed).
- All other tabs are clickable and route to a **"Coming Soon"** placeholder page (same layout shell, centered message + illustration, no functional content).

### 6.2 Product Listing (functional page)
- Own dedicated route/page (e.g. `/dashboard/catalog/product-listing`), reachable via the **Catalog** tab (or a dedicated "Product Listing" link within it) — not a modal, not embedded in Home.
- **Form fields** (per agreed scope — bare minimum + images):
  - Product name (text)
  - Price (numeric)
  - Category (dropdown/select — reuse `TileGroup`-style component if convenient)
  - Quantity (numeric — reuse `NumericTile`)
  - Product images (multi-file upload with preview)
- On submit: POST to `/api/products`, associate with the seller's `sellerId` from LocalStorage.
- Below/alongside the form: a simple table or card grid listing all products the seller has already submitted (fetched via `/api/products/:sellerId`), so the seller can see what they've added.
- Basic validation: required fields, price/quantity must be positive numbers, at least one image recommended (not necessarily hard-blocked, keep demo-friendly).

### 6.3 Coming Soon placeholder page
- Single reusable component, parameterized by tab name (e.g., "Buying & Inventory — Coming Soon").
- Applies to: Buying & Inventory, Orders & Returns, Growth, Pricing/Promo & Ads, Payment, Business Health, Reports, Support (and any Catalog sub-sections beyond Product Listing).

---

## 7. Feature 4: Carry Over Onboarding Support Features

The dashboard (Home, Product Listing, and Coming Soon pages) should inherit the same support layer already built for onboarding, so the experience doesn't regress once the seller leaves the manifest-driven flow:

- **Trilingual UI**: `en` / `ta` / `hi` language toggle available in the dashboard header, using the same translation approach as onboarding.
- **AI Help Bot**: The `❓` help button and `/api/chat` Gemini-powered assistant should be available on all dashboard pages, contextually grounded to dashboard-relevant docs (e.g., explain "Product Listing" fields, explain what "Coming Soon" means) the same way onboarding grounds explanations to onboarding docs.
- **TTS/Voice-first support**: Any instructional or confirmation text on the dashboard (e.g., the post-submit message, Product Listing form labels/errors) should support the same voluntary "Listen" read-aloud pattern.
- **Keyboard support**: On-screen Tamil/Hindi keyboards should be available wherever free-text input exists on the dashboard (e.g., Product Listing's product name field), consistent with onboarding's `AlphanumericTile`/`VoiceInput` components.

---

## 8. Out of Scope (explicit)

- Login/authentication of any kind (per demo scope — session/localStorage identifies the seller).
- Functional Buying & Inventory, Orders & Returns, Growth, Pricing/Promo & Ads, Payment, Business Health, Reports, or Support tabs (Coming Soon only).
- Editing/deleting product listings (v1 is add + view only, unless prioritized later).
- Real payment, order, or ads data of any kind.
- Production security hardening (data encryption at rest, GDPR/DPDP-style compliance, rate limiting) — call out as future consideration.

---

## 9. Open Questions / Future Considerations

- Should submitted seller `answers` continue to include the plain password field, or should the dashboard/PRD explicitly call for hashing before MongoDB write? (Recommend hashing even in a demo, to avoid setting a bad precedent — flagging for a decision.)
- Should Product Listings support edit/delete in a later iteration?
- Should the "Coming Soon" pages eventually get their own lightweight PRDs as those modules get prioritized?

---

## 10. Success Criteria (for this demo milestone)

- A seller can complete onboarding, see the confirmation screen, and reach the dashboard via the link.
- Seller's submitted onboarding answers are retrievable from MongoDB (not just LocalStorage).
- Seller can add a product (with image) via Product Listing and see it appear in a list, persisted in MongoDB.
- All non-Product-Listing nav tabs are clickable and show a Coming Soon page without breaking navigation.
- Language switch, help bot, and TTS work on the dashboard the same way they do in onboarding.
