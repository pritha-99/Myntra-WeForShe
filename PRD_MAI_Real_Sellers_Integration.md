# PRD: Real Sellers on the "Made Across India" Map

**Project:** Made Across India (MAI) — Customer-Side Prototype × Seller Onboarding
**Doc owner:** Riddhi
**Status:** Draft v1
**Last updated:** July 21, 2026

---

## 1. Background

Two prototypes currently exist independently:

1. **Seller Onboarding + Dashboard** (Bharat Onboarding) — sellers submit registration details, which are persisted in MongoDB (`sellers` collection), and can add products via the dashboard's Product Listing page (`products` collection).
2. **Made Across India (MAI)** — a customer-facing discovery experience (map, seller stories, catalogues, PDP) that currently runs entirely on **mock data** (`data.js`), with no backend connection.

These two prototypes have never been connected. Today, a seller can complete onboarding and list products, but they will never appear anywhere a customer can see them — MAI only shows its fictional artisan dataset.

This PRD defines how a **real onboarded seller becomes visible on the MAI map and throughout the MAI customer journey**, alongside the existing mock sellers.

---

## 2. Goals

- Once a seller has onboarded **and** listed at least one product, they should appear on the MAI map, in search/filter results, in the seller directory, and (if a catalogue is opened) with their real product listings.
- Real sellers and mock sellers coexist seamlessly in the same UI — the customer shouldn't be able to tell which is which structurally.
- Give sellers a lightweight, optional way to add "story" content (the narrative slides MAI uses) from their dashboard, without requiring it before they can appear on the map.
- Keep MAI's existing mock-data experience fully intact as a fallback/demo layer — this is additive, not a replacement.

### Non-goals
- No real-time sync/websockets — a simple fetch-on-load (or fetch-on-navigate) from a backend endpoint is sufficient.
- No seller verification workflow (e.g. GI-tag authentication, "verified" badge review process) — field exists in the schema but is not actively managed in this iteration.
- No changes to the onboarding form's core registration fields beyond what's needed for map placement (see §4).
- No moderation/approval queue — visibility is governed purely by the rule in §5, not by a human reviewer.

---

## 3. User Flow (End-to-End)

```
SELLER SIDE                                    CUSTOMER SIDE (MAI)
────────────                                   ───────────────────
Onboarding submitted → sellers (MongoDB)
        ↓
Dashboard → Product Listing
  → adds ≥1 product → products (MongoDB)
        ↓
[Seller now eligible for MAI]         →        MAI fetches real sellers,
        ↓                                       merges with mock data
Dashboard → (optional) Seller Story            
  → adds narrative slides/photos      →        If present: story slides show
                                                real content instead of
                                                placeholder/no-story state
```

A seller who has only onboarded (no products yet) is **not** shown on MAI. A seller with ≥1 product is shown, with or without a story.

---

## 4. Data Model & Field Mapping

MAI's mock sellers use a rich schema (id, name, founder, city, state, craft tags, description, story content, products, verification status, story availability, "new" status). Real sellers won't have most of this from onboarding alone — the table below defines where each field comes from.

| MAI field | Source | Notes |
|---|---|---|
| `id` | `sellers.sellerId` | Reused as-is |
| `name` | `sellers.answers.businessName` | Existing onboarding field |
| `founder` | `sellers.answers.businessName` (fallback) | No dedicated "founder name" field exists yet; use business name unless/until a dedicated field is added |
| `city` / `state` | Derived from `sellers.answers.pincode` | Reuse the existing (currently mocked) `/api/lookup/pincode` logic to resolve pincode → city/state |
| `craftTags` | Derived from `products.category` (deduped across all of a seller's products) | No separate "craft type" field is being added to onboarding — the product category(ies) a seller lists double as their craft tag(s) on the map/filters |
| `description` | `sellers.answers.businessName` + generic template, OR seller-authored text from the optional Story feature | Kept minimal unless the seller adds a story |
| `products` | `products` collection, filtered by `sellerId` | Real images, name, price, quantity from Product Listing |
| `story` (slides) | New optional dashboard feature (§6) | Empty/absent if seller hasn't added one |
| `hasStory` (boolean) | `true` if seller has ≥1 story slide saved, else `false` | Drives whether MAI shows a story ring/entry point for that seller |
| `verified` (boolean) | Defaults to `false` | No verification workflow in this iteration; reserved for future use |
| `isNew` / "Freshly Onboarded" | `true` if `products` first-created date is within a configurable window (default: 30 days) | Powers the existing "Freshly Onboarded" filter chip |

---

## 5. Visibility Rule

A seller is included in MAI's real-seller feed **if and only if**:
- Their `sellers` record exists (onboarding submitted), **and**
- They have at least one document in `products` referencing their `sellerId`.

This is a computed/derived condition (e.g. a Mongo aggregation joining `sellers` and `products`), not a manually-set status flag — keeping it consistent with the "no approval step" decision.

---

## 6. Dashboard Addition: Optional Seller Story

A new, functional (not "Coming Soon") dashboard page: **My Story**, reachable from the dashboard nav (e.g. under Catalog, alongside Product Listing).

- Lets a seller optionally add:
  - A short craft/business description (free text, with the same voice-input and multilingual keyboard support as onboarding).
  - One or more "slides": an image + short caption each, mirroring MAI's existing story-slide structure (narrative text + visual background).
- Entirely optional — skipping this has no effect on whether the seller appears on the map (that's governed only by §5).
- Saved to a new `stories` collection (or embedded array on the `sellers` document — implementation detail, either is acceptable):
  - `sellerId`, `slides: [{ imageUrl, caption }]`, `updatedAt`.
- If a seller has no story, MAI should treat them exactly as it currently treats mock sellers with `storyAvailable: false` — no story ring, tapping their card goes straight to the catalogue.

---

## 7. Backend Changes

### 7.1 New endpoint
- **`GET /api/mai/sellers`** — returns the merged-ready real-seller feed:
  - Runs the join/filter described in §5.
  - Shapes each result into the MAI field structure from §4 (server-side mapping, so the frontend doesn't need to know about onboarding's raw schema).
  - Includes each seller's products (or a `GET /api/mai/sellers/:sellerId/products` sub-route if payload size becomes a concern).

### 7.2 Existing endpoint reuse
- Pincode → city/state resolution reuses the existing mocked `/api/lookup/pincode` dataset. If a seller's pincode isn't in the existing mock lookup table, define a fallback (e.g. omit state-specific placement, or bucket under "Other" — flagged as an open question in §10).

### 7.3 New endpoint for stories
- **`POST /api/seller/story`** — save/update a seller's story slides.
- **`GET /api/mai/sellers/:sellerId/story`** — used internally by the `/api/mai/sellers` aggregation, or exposed directly if MAI lazy-loads story content only when a user taps into it.

---

## 8. Frontend Changes (MAI)

- On load (or on entering the MAI landing screen), fetch `GET /api/mai/sellers` and merge the result with the existing `data.js` mock array into a single in-memory list that all existing rendering logic (map highlighting, search, filters, seller directory, story engine, catalogue, PDP) already operates on.
- No structural changes needed to `app.js`'s rendering functions if the merged objects conform to the existing mock schema shape — this is the main reason field mapping happens server-side (§7.1) rather than in the frontend.
- **Map highlighting**: states with at least one real seller must highlight exactly like states with mock sellers today — validate that resolved `state` values match the existing SVG map's state-name/ID conventions.
- **Filter chips**: "Freshly Onboarded" chip must correctly surface real sellers where `isNew` is true; craft-tag chips (Textiles, Pottery, etc.) must correctly match real sellers' derived `craftTags`.
- If the `/api/mai/sellers` fetch fails (e.g. backend unavailable), MAI should fail gracefully and simply show mock data only — this keeps the prototype demoable even if the backend isn't running.

---

## 9. Out of Scope

- Seller verification / GI-tag authentication workflow.
- Manual moderation or approval queue for map visibility.
- Real-time updates (e.g. a customer's map auto-refreshing the moment a new seller lists a product) — refresh on navigation/load is sufficient.
- Editing or removing a story once published (v1 is add/overwrite via re-save only, unless prioritized later).
- Any change to onboarding's core registration questions beyond reusing existing pincode data.

---


---

## 10. Success Criteria

- A seller who has onboarded but not listed any products does **not** appear anywhere in MAI.
- A seller who has onboarded and listed ≥1 product appears on the map (correct state highlighted), in search, in relevant craft filters, and in the seller directory — indistinguishable in presentation from a mock seller.
- That seller's real products appear correctly in their catalogue and PDP screens.
- A seller who has added an optional story sees their real slides in the MAI story experience; a seller who hasn't behaves exactly like a `storyAvailable: false` mock seller.
- If the backend/API is unavailable, MAI still renders normally using mock data only.
