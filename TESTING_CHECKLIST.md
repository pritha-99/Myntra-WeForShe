# MAI Real Sellers Integration - Testing Checklist

## Pre-Testing Setup

### Environment Setup
- [ ] Node.js and npm installed
- [ ] MongoDB installed and running
- [ ] Both workspaces (`everything` and `MYNTRA-CUSTOMER-SIDE`) available
- [ ] Backend dependencies installed (`cd everything/backend && npm install`)
- [ ] Frontend dependencies installed (`cd everything/frontend && npm install`)

### Database Setup
- [ ] MongoDB running on `mongodb://127.0.0.1:27017`
- [ ] Database `bharat_onboarding` exists
- [ ] Collections created (automatic on first write)

## Backend Testing

### Server Startup
- [ ] Server starts without errors: `cd everything/backend && npm start`
- [ ] Console shows: `✅ Bharat Onboarding backend running on http://localhost:4000`
- [ ] Console shows: `🍃 MongoDB connected: mongodb://127.0.0.1:27017/bharat_onboarding`

### API Endpoints
- [ ] Health check works: `curl http://localhost:4000/api/health`
  - Expected: `{"status":"ok","service":"bharat-onboarding-backend","db":"connected"}`
- [ ] MAI sellers endpoint exists: `curl http://localhost:4000/api/mai/sellers`
  - Expected: `{"sellers":[]}` (if no data) or array of sellers
- [ ] Returns valid JSON (no syntax errors)

### Pincode Resolution
Test pincode to state mapping:
- [ ] Rajasthan: `302001` → `"Rajasthan"`
- [ ] Tamil Nadu: `600001` → `"Tamil Nadu"`
- [ ] Karnataka: `560001` → `"Karnataka"`
- [ ] Invalid pincode: `999999` → `null`

### Data Seeding (Optional)
- [ ] Seed script runs: `cd everything/backend && node test-seed-seller.js`
- [ ] Script creates test seller
- [ ] Script creates test product
- [ ] API now returns seller: `curl http://localhost:4000/api/mai/sellers`

## MAI Frontend Testing

### Page Load
- [ ] Open `MYNTRA-CUSTOMER-SIDE/made-across-india/index.html` in browser
- [ ] Page loads without console errors
- [ ] Map SVG displays correctly
- [ ] No JavaScript syntax errors

### Real Sellers Integration
- [ ] Console shows: `📍 Loaded X real sellers + 12 mock sellers = Y total`
- [ ] If backend unavailable: Console shows warning, shows mock data only
- [ ] Real sellers count matches API response

### Map Interaction
- [ ] States with real sellers are highlighted (orange overlay)
- [ ] State badges show correct seller count
- [ ] Clicking highlighted state opens seller list
- [ ] Real sellers appear in the list
- [ ] Real sellers appear BEFORE mock sellers

### Search Functionality
- [ ] Search for real seller's business name → finds it
- [ ] Search for real seller's city → finds it
- [ ] Search for real seller's state → finds it
- [ ] Search results show both real and mock sellers

### Filter Chips
- [ ] Clicking craft filter (e.g., "Textiles") filters sellers
- [ ] Real sellers with matching category appear
- [ ] "Freshly Onboarded" chip shows new real sellers (if < 30 days)
- [ ] "All" chip shows all sellers (real + mock)

### Seller View
- [ ] Clicking real seller opens their view
- [ ] If no story: Goes directly to catalogue
- [ ] If has story (mock): Shows story slides

### Catalogue View
- [ ] Real seller's name displays correctly
- [ ] City and state display correctly (from pincode)
- [ ] Craft tag displays (from product category)
- [ ] Description shows business name
- [ ] Product grid displays all seller's products
- [ ] Product images load (if uploaded)
- [ ] Product names, prices display correctly

### Product Detail Page (PDP)
- [ ] Clicking product opens PDP
- [ ] Product image displays
- [ ] Product name, price, MRP display
- [ ] Craft description shows
- [ ] "Add to Bag" button works (shows toast)
- [ ] Back navigation works

### List View
- [ ] Toggle to list view works
- [ ] Real sellers appear in list
- [ ] Seller cards show correct info
- [ ] Clicking card opens seller

## Dashboard Testing

### Server Startup
- [ ] Dashboard starts: `cd everything/frontend && npm run dev`
- [ ] Opens in browser: `http://localhost:5173`

### Navigation
- [ ] All nav items visible
- [ ] "My Story" nav item present (between Catalog and Orders)
- [ ] Clicking "My Story" navigates to page

### My Story Page
- [ ] Page loads without errors
- [ ] Shows "Coming Soon" content
- [ ] Feature list displays
- [ ] Status badge shows
- [ ] All languages work (English, Hindi, Tamil)

### Product Listing Integration
- [ ] Can add products via dashboard
- [ ] After adding product, it appears in MongoDB: `db.products.find()`
- [ ] Refresh MAI → new product appears in catalogue

## End-to-End Testing

### Complete Seller Journey
- [ ] 1. Complete onboarding form
- [ ] 2. Note seller ID from confirmation
- [ ] 3. Navigate to dashboard
- [ ] 4. Go to Product Listing page
- [ ] 5. Add product with image
- [ ] 6. Product saves successfully
- [ ] 7. Open MAI frontend
- [ ] 8. Seller appears on map (state highlighted)
- [ ] 9. Click state → seller in list
- [ ] 10. Click seller → catalogue shows product
- [ ] 11. Product image and details correct

### Multiple Sellers Test
- [ ] Create 3 sellers with products in different states
- [ ] MAI shows all 3 states highlighted
- [ ] Each state shows correct seller count
- [ ] Clicking each state shows correct sellers
- [ ] Filters work across all sellers

### Backend Failure Test
- [ ] Stop backend server
- [ ] Refresh MAI
- [ ] Console shows: "Backend unavailable, using mock data only"
- [ ] Map still works (shows 12 mock sellers)
- [ ] All features work with mock data
- [ ] No JavaScript errors or crashes

## API Response Validation

### GET /api/mai/sellers
Response structure check:
```json
{
  "sellers": [
    {
      "id": "string",          ✅
      "name": "string",        ✅
      "founder": "string",     ✅
      "city": "string",        ✅
      "state": "string",       ✅
      "craft": ["string"],     ✅
      "description": "string", ✅
      "story": [],             ✅
      "products": [{           ✅
        "name": "string",
        "price": number,
        "mrp": number,
        "imgPath": "string",
        "craft": "string",
        "emoji": "string",
        "gi": boolean
      }],
      "verified": false,       ✅
      "hasStory": false,       ✅
      "isNew": boolean         ✅
    }
  ]
}
```

### Field Validation
- [ ] All required fields present
- [ ] `state` matches valid Indian state name
- [ ] `state` matches `STATE_PATH_MAP` keys in data.js
- [ ] `craft` array not empty
- [ ] `products` array not empty
- [ ] `isNew` correctly calculated (check product createdAt)

## Performance Testing

### Load Time
- [ ] MAI loads in < 3 seconds
- [ ] API responds in < 500ms
- [ ] Image lazy loading works
- [ ] No memory leaks in console

### Large Dataset
- [ ] Create 50 sellers with products
- [ ] MAI still loads reasonably fast
- [ ] Map interactions remain smooth
- [ ] Search remains responsive

## Cross-Browser Testing
- [ ] Chrome: All features work
- [ ] Firefox: All features work
- [ ] Safari: All features work
- [ ] Edge: All features work

## Mobile Responsiveness (MAI)
- [ ] Map visible and interactive
- [ ] Touch interactions work
- [ ] Story swipe works
- [ ] Product cards display correctly

## Translation Testing (Dashboard)

### English
- [ ] "My Story" nav label correct
- [ ] Page title: "My Story"
- [ ] Content in English

### Hindi (हिन्दी)
- [ ] Nav label: "मेरी कहानी"
- [ ] Page title: "मेरी कहानी"
- [ ] Content in Hindi

### Tamil (தமிழ்)
- [ ] Nav label: "என் கதை"
- [ ] Page title: "என் கதை"
- [ ] Content in Tamil

## Edge Cases

### No Products
- [ ] Seller with 0 products does NOT appear on MAI
- [ ] API excludes seller from response

### Invalid Pincode
- [ ] Seller with invalid pincode excluded
- [ ] Or: shown under "Other" (if implemented)

### No Images
- [ ] Product without images shows emoji fallback
- [ ] No broken image icons

### Long Text
- [ ] Very long business names don't break layout
- [ ] Long product names truncate correctly

### Special Characters
- [ ] Business names with special chars display correctly
- [ ] Product names with emojis work

## Security Testing

### API
- [ ] No sensitive data in responses
- [ ] CORS configured correctly
- [ ] File uploads limited to /uploads directory

### Input Validation
- [ ] Pincode validation (6 digits)
- [ ] Price validation (positive numbers)
- [ ] Category validation (non-empty)

## Documentation Testing

### README Files
- [ ] `MAI_INTEGRATION_README.md` accurate
- [ ] `IMPLEMENTATION_SUMMARY.md` complete
- [ ] `QUICKSTART.md` works step-by-step
- [ ] `ARCHITECTURE_DIAGRAM.md` reflects actual code

### Code Comments
- [ ] All new files have header comments
- [ ] Complex logic explained
- [ ] API endpoints documented

## Deployment Readiness

### Configuration
- [ ] API URL configurable (not hardcoded)
- [ ] MongoDB URI from environment variable
- [ ] Port configurable

### Error Handling
- [ ] All API errors caught and handled
- [ ] User-friendly error messages
- [ ] No uncaught promise rejections

### Logging
- [ ] Backend logs meaningful messages
- [ ] Frontend logs help debugging
- [ ] No console.log spam in production

## Success Metrics (from PRD)

### ✅ Core Requirements Met
- [ ] Sellers without products do NOT appear on MAI
- [ ] Sellers with ≥1 product appear on map
- [ ] State highlighting correct
- [ ] Real sellers in search results
- [ ] Real sellers work with filters
- [ ] Real products display in catalogue
- [ ] Real products display in PDP
- [ ] Sellers without story behave correctly
- [ ] Backend failure handled gracefully

### ✅ Integration Points Working
- [ ] Pincode → State resolution
- [ ] Category → Craft tags
- [ ] Products → Catalogue
- [ ] Image uploads → Display
- [ ] Freshly Onboarded calculation

## Final Sign-Off

### Technical Review
- [ ] All code follows project conventions
- [ ] No lint errors
- [ ] No console warnings (except expected)
- [ ] Git commits clean and descriptive

### Feature Completeness
- [ ] All PRD requirements implemented
- [ ] No critical bugs
- [ ] Edge cases handled
- [ ] Documentation complete

### Ready for Demo
- [ ] Test data seeded
- [ ] Both servers running
- [ ] Demo script prepared
- [ ] Backup plan if live demo fails

---

## Testing Summary

**Tests Passed**: ___ / 200+  
**Critical Issues**: ___  
**Minor Issues**: ___  
**Status**: 🟢 Ready / 🟡 Needs Work / 🔴 Not Ready  

**Tested By**: _______________  
**Date**: _______________  
**Version**: _______________  

**Notes**:
_______________________________________________________
_______________________________________________________
_______________________________________________________
