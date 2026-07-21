# Made Across India - Real Sellers Integration

## Overview
This implementation connects the Bharat Onboarding seller system with the Made Across India (MAI) customer-facing map, allowing real sellers to appear alongside mock sellers.

## What Was Implemented

### 1. Backend Changes

#### New Utility: Pincode to State Mapping
- **File**: `everything/backend/src/utils/pincodeToState.js`
- Maps 6-digit Indian pincodes to their corresponding states
- Uses official Indian postal code allocation system
- Supports all Indian states and union territories

#### New API Route: `/api/mai`
- **File**: `everything/backend/src/routes/mai.js`
- **Endpoints**:
  - `GET /api/mai/sellers` - Returns all eligible real sellers in MAI format
  - `GET /api/mai/sellers/:sellerId` - Returns a specific seller in MAI format

#### Seller Eligibility Logic
Real sellers appear on MAI if and only if:
- Their seller record exists in MongoDB (onboarding submitted)
- They have at least 1 product listed in the `products` collection

#### Field Mapping (Real → MAI Format)
| MAI Field | Source | Logic |
|-----------|--------|-------|
| `id` | `sellers.sellerId` | Direct mapping |
| `name` | `sellers.answers.businessName` | Business name from onboarding |
| `founder` | `sellers.answers.businessName` | Using business name as fallback |
| `city` | Derived from pincode | Using common pincode prefixes |
| `state` | `pincodeToState(pincode)` | Resolved via pincode utility |
| `craft` | `products.category` | Deduplicated array of product categories |
| `description` | Generated template | "{businessName} — Authentic handcrafted products from {state}" |
| `products` | `products` collection | Real product data with images |
| `story` | `[]` | Empty for now (mock stories retained) |
| `hasStory` | `false` | No story feature in this iteration |
| `verified` | `false` | No verification workflow yet |
| `isNew` | Computed | True if first product created within 30 days |

### 2. Frontend Changes (MAI)

#### Data Layer Updates
- **File**: `MYNTRA-CUSTOMER-SIDE/made-across-india/data.js`
- Renamed `SELLERS` to `MOCK_SELLERS`
- Added `fetchRealSellers()` function to call backend API
- Added `initializeSellers()` to merge real + mock sellers
- Real sellers appear first in the merged list
- Dynamic `SELLERS_BY_STATE` rebuild after merge

#### App Logic Updates
- **File**: `MYNTRA-CUSTOMER-SIDE/made-across-india/app.js`
- Changed `init()` to async function
- Calls `await initializeSellers()` before rendering UI
- Graceful fallback: if backend unavailable, shows mock data only
- All existing rendering logic works unchanged (map, filters, catalogue, etc.)

### 3. Dashboard Changes

#### New Page: "My Story"
- **File**: `everything/frontend/src/dashboard/MyStoryPage.jsx`
- Added to dashboard navigation as a top-level item
- Shows "Coming Soon" UI with feature preview
- Explains what the story feature will offer
- Notes that mock stories are used for now

#### Navigation Updates
- **File**: `everything/frontend/src/dashboard/DashboardLayout.jsx`
- Added "My Story" to `NAV_ITEMS` array

#### Routing Updates
- **File**: `everything/frontend/src/App.jsx`
- Added route: `/dashboard/my-story` → `<MyStoryPage />`

#### Translation Strings
- Added `dashboardMyStory`, `myStoryTitle`, `myStoryComingSoon` to:
  - `everything/frontend/src/i18n/en.json`
  - `everything/frontend/src/i18n/hi.json`
  - `everything/frontend/src/i18n/ta.json`

## Testing the Integration

### Prerequisites
1. MongoDB running on `mongodb://127.0.0.1:27017/bharat_onboarding`
2. Backend server running on `http://localhost:4000`
3. At least one seller with products in the database

### Test Workflow

1. **Create a Test Seller**:
   ```bash
   cd everything/backend
   node test-seed-seller.js
   ```

2. **Start Backend**:
   ```bash
   cd everything/backend
   npm start
   ```
   Should see: `✅ Bharat Onboarding backend running on http://localhost:4000`

3. **Test Backend API**:
   ```bash
   curl http://localhost:4000/api/mai/sellers
   ```
   Should return JSON with real sellers array

4. **Open MAI Frontend**:
   ```bash
   cd MYNTRA-CUSTOMER-SIDE/made-across-india
   # Open index.html in browser or use live-server
   ```

5. **Verify Integration**:
   - Check browser console for: `📍 Loaded X real sellers + 12 mock sellers = Y total`
   - Map should highlight states with real sellers
   - Search/filters should include real sellers
   - Clicking a state with real sellers should show them
   - Real seller products should display correctly

6. **Test Dashboard**:
   ```bash
   cd everything/frontend
   npm run dev
   ```
   - Navigate to dashboard
   - Click "My Story" in navigation
   - Should see coming soon page

## API Response Format

### GET /api/mai/sellers
```json
{
  "sellers": [
    {
      "id": "SLR-ABC123",
      "name": "Rajasthani Handicrafts",
      "founder": "Rajasthani Handicrafts",
      "city": "Jaipur",
      "state": "Rajasthan",
      "craft": ["Textiles", "Pottery"],
      "description": "Rajasthani Handicrafts — Authentic handcrafted products from Rajasthan.",
      "story": [],
      "products": [
        {
          "name": "Block Print Kurta",
          "price": 1200,
          "mrp": 1680,
          "imgPath": "/uploads/product-123.png",
          "craft": "Textiles. 10 available.",
          "emoji": "🛍",
          "gi": false
        }
      ],
      "verified": false,
      "hasStory": false,
      "isNew": true
    }
  ]
}
```

## Configuration

### Backend API URL
Update in `MYNTRA-CUSTOMER-SIDE/made-across-india/data.js`:
```javascript
const API_BASE_URL = 'http://localhost:4000';
```

### Pincode Mapping
Add custom city mappings in `everything/backend/src/routes/mai.js`:
```javascript
const cityMap = {
  '560': 'Bengaluru',
  '400': 'Mumbai',
  // Add more...
};
```

## Known Limitations

1. **Story Feature**: Not implemented - mock stories used for all sellers
2. **City Resolution**: Uses simple prefix matching, not full pincode API
3. **Verification**: All sellers show `verified: false` - no verification workflow
4. **MRP Estimation**: Calculated as `price * 1.4` - not from real data
5. **Refresh**: Manual page refresh needed to see new sellers (no real-time updates)

## Future Enhancements (Out of Scope)

- [ ] Story authoring feature in dashboard
- [ ] Image upload for story slides
- [ ] GI-tag verification workflow
- [ ] Full pincode API integration for accurate city/state
- [ ] Real-time seller updates (WebSocket)
- [ ] Seller moderation/approval queue
- [ ] Story editing/deletion
- [ ] Analytics tracking for seller visibility

## File Structure

```
everything/backend/src/
├── utils/
│   └── pincodeToState.js          # NEW: Pincode → State mapper
├── routes/
│   └── mai.js                     # NEW: MAI API endpoints
└── server.js                       # MODIFIED: Added MAI routes

MYNTRA-CUSTOMER-SIDE/made-across-india/
├── data.js                        # MODIFIED: Fetch + merge logic
└── app.js                         # MODIFIED: Async initialization

everything/frontend/src/
├── dashboard/
│   ├── DashboardLayout.jsx        # MODIFIED: Added My Story nav
│   └── MyStoryPage.jsx            # NEW: Coming soon page
├── i18n/
│   ├── en.json                    # MODIFIED: Added translations
│   ├── hi.json                    # MODIFIED: Added translations
│   └── ta.json                    # MODIFIED: Added translations
└── App.jsx                        # MODIFIED: Added My Story route
```

## Troubleshooting

### "No real sellers appearing on map"
- Check MongoDB has sellers with products: `db.products.count()`
- Verify backend is running: `curl http://localhost:4000/api/health`
- Check browser console for API errors

### "State not highlighting"
- Verify pincode resolves correctly: Check `pincodeToState.js` mappings
- Ensure state name matches MAI's `STATE_PATH_MAP` in `data.js`

### "Backend unavailable" in console
- This is expected if backend isn't running
- MAI will show mock data only (graceful fallback)

## Success Criteria ✅

- [x] Real sellers with products appear on MAI map
- [x] Real sellers appear first in merged list
- [x] State highlighting works for real sellers
- [x] Search/filters include real sellers
- [x] Real products display in catalogue
- [x] Graceful fallback when backend unavailable
- [x] "My Story" page in dashboard navigation
- [x] Pincode resolves to correct Indian state
- [x] "Freshly Onboarded" filter works for real sellers

## Support

For issues or questions, refer to:
- Main PRD: `PRD_MAI_Real_Sellers_Integration.md`
- Backend docs: `everything/backend/README.md`
- Frontend docs: `everything/frontend/README.md`
