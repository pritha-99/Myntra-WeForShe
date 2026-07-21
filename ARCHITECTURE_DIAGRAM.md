# MAI Real Sellers Integration - Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SELLER SIDE                                      │
│                                                                          │
│  ┌──────────────────┐         ┌──────────────────┐                     │
│  │ Bharat Onboarding│         │ Seller Dashboard │                     │
│  │   (React App)    │         │   (React App)    │                     │
│  │                  │         │                  │                     │
│  │  • Registration  │         │  • Home          │                     │
│  │  • Multi-step    │         │  • Product List  │                     │
│  │  • Voice support │         │  • My Story ⭐   │                     │
│  └────────┬─────────┘         └────────┬─────────┘                     │
│           │                            │                                │
│           │ POST /api/seller/submit    │ POST /api/products            │
│           │                            │ (with images)                 │
└───────────┼────────────────────────────┼─────────────────────────────────┘
            │                            │
            ▼                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND SERVER                                   │
│                     (Express + MongoDB)                                  │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  Routes                                                            │ │
│  │  ├─ /api/seller      (Onboarding submission)                      │ │
│  │  ├─ /api/products    (Product listing)                            │ │
│  │  └─ /api/mai ⭐      (MAI integration - NEW)                       │ │
│  │      ├─ GET /sellers                                               │ │
│  │      └─ GET /sellers/:id                                           │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  Utils                                                             │ │
│  │  └─ pincodeToState.js ⭐ (NEW)                                     │ │
│  │     Maps 6-digit pincode → Indian state                           │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│           │                                                              │
│           ▼                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  MongoDB Collections                                               │ │
│  │  ├─ sellers    (onboarding data)                                  │ │
│  │  └─ products   (product listings with images)                     │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │
                                 │ GET /api/mai/sellers
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         CUSTOMER SIDE                                    │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │           Made Across India (MAI)                                │  │
│  │              (Vanilla JS App)                                    │  │
│  │                                                                  │  │
│  │  ┌────────────────────────────────────────────────────────┐    │  │
│  │  │  data.js ⭐ (MODIFIED)                                  │    │  │
│  │  │  • fetchRealSellers() - calls backend API              │    │  │
│  │  │  • initializeSellers() - merges real + mock            │    │  │
│  │  │  • SELLERS = [real..., mock...]                        │    │  │
│  │  └────────────────────────────────────────────────────────┘    │  │
│  │                                                                  │  │
│  │  ┌────────────────────────────────────────────────────────┐    │  │
│  │  │  app.js ⭐ (MODIFIED)                                   │    │  │
│  │  │  • async init() - waits for sellers                    │    │  │
│  │  │  • Existing rendering logic unchanged                  │    │  │
│  │  └────────────────────────────────────────────────────────┘    │  │
│  │                                                                  │  │
│  │  ┌────────────────────────────────────────────────────────┐    │  │
│  │  │  UI Features                                           │    │  │
│  │  │  ✅ Interactive India map                              │    │  │
│  │  │  ✅ State highlighting                                 │    │  │
│  │  │  ✅ Search by seller/city/craft                        │    │  │
│  │  │  ✅ Filter chips (Textiles, Pottery, etc.)            │    │  │
│  │  │  ✅ Seller directory (list view)                      │    │  │
│  │  │  ✅ Story slides                                       │    │  │
│  │  │  ✅ Product catalogue                                  │    │  │
│  │  │  ✅ Product Detail Page (PDP)                         │    │  │
│  │  └────────────────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Transformation Pipeline

```
┌────────────────────┐
│ Seller Onboards    │
│ answers: {         │
│   businessName,    │
│   pincode,         │
│   ...              │
│ }                  │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Seller Lists       │
│ Products           │
│ {                  │
│   name,            │
│   price,           │
│   category,        │
│   images[]         │
│ }                  │
└─────────┬──────────┘
          │
          ▼
┌─────────────────────────────────────────────────┐
│ /api/mai/sellers Endpoint                       │
│                                                 │
│ 1. Aggregate sellers who have products         │
│ 2. For each seller:                            │
│    • Resolve pincode → state                   │
│    • Extract city from pincode prefix          │
│    • Dedupe product categories → craft tags    │
│    • Check if new (products < 30 days)         │
│    • Transform products to MAI format          │
│    • Build MAI seller object                   │
└─────────┬───────────────────────────────────────┘
          │
          ▼
┌────────────────────────────────────────────────┐
│ MAI Seller Format                              │
│ {                                              │
│   id: "SLR-ABC123",                           │
│   name: "Rajasthani Handicrafts",             │
│   city: "Jaipur",                             │
│   state: "Rajasthan",                         │
│   craft: ["Textiles", "Pottery"],             │
│   products: [                                 │
│     {                                         │
│       name: "Block Print Kurta",              │
│       price: 1200,                            │
│       imgPath: "/uploads/product-123.png"     │
│     }                                         │
│   ],                                          │
│   isNew: true,                                │
│   hasStory: false,                            │
│   verified: false                             │
│ }                                              │
└────────┬───────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────┐
│ MAI Frontend Merge                             │
│                                                │
│ SELLERS = [                                    │
│   ...realSellers,    ← Fetched from API       │
│   ...mockSellers     ← Hardcoded in data.js   │
│ ]                                              │
└────────┬───────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────┐
│ Customer Experience                            │
│ • Sees unified seller list                    │
│ • No visual distinction real vs mock          │
│ • Real sellers appear first                   │
│ • All features work identically                │
└────────────────────────────────────────────────┘
```

## Component Interaction Flow

### Seller Onboarding → Map Visibility

```
Step 1: Seller Registration
┌──────────────────────────────────┐
│ User fills onboarding form       │
│ • Business name: "Jaipur Crafts" │
│ • Pincode: 302001                │
│ • Other details...               │
└──────────────┬───────────────────┘
               │
               ▼
        POST /api/seller/submit
               │
               ▼
┌──────────────────────────────────┐
│ MongoDB: sellers collection      │
│ {                                │
│   sellerId: "SLR-XYZ",          │
│   answers: {                     │
│     businessName: "Jaipur Craft",│
│     pincode: "302001"            │
│   }                              │
│ }                                │
└──────────────────────────────────┘
               
               ❌ NOT visible on MAI yet!
               (No products)


Step 2: Product Listing
┌──────────────────────────────────┐
│ Seller goes to dashboard         │
│ • Product Listing page           │
│ • Adds product with image        │
└──────────────┬───────────────────┘
               │
               ▼
        POST /api/products
               │
               ▼
┌──────────────────────────────────┐
│ MongoDB: products collection     │
│ {                                │
│   sellerId: "SLR-XYZ",          │
│   name: "Block Print Kurta",    │
│   price: 1200,                   │
│   category: "Textiles",          │
│   images: ["/uploads/..."]      │
│ }                                │
└──────────────────────────────────┘
               
               ✅ NOW visible on MAI!


Step 3: MAI Fetch
┌──────────────────────────────────┐
│ Customer opens MAI               │
│ initializeSellers() runs         │
└──────────────┬───────────────────┘
               │
               ▼
        GET /api/mai/sellers
               │
               ▼
┌──────────────────────────────────────────┐
│ Backend aggregation:                     │
│ 1. Find sellers with products ✅         │
│ 2. Resolve 302001 → Rajasthan            │
│ 3. Extract craft: ["Textiles"]           │
│ 4. Transform to MAI format               │
└──────────────┬───────────────────────────┘
               │
               ▼
        Return seller JSON
               │
               ▼
┌──────────────────────────────────────────┐
│ MAI merges with mock sellers             │
│ SELLERS = [realSeller, ...mockSellers]   │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│ Map highlights Rajasthan                 │
│ Search finds "Jaipur Crafts"             │
│ Filters include seller in "Textiles"     │
│ Catalogue shows real product             │
└──────────────────────────────────────────┘
```

## Key Integration Points

### 1. Visibility Gate
```javascript
// Backend: mai.js
const sellersWithProducts = await Product.aggregate([
  { $group: { _id: '$sellerId', productCount: { $sum: 1 } } },
  { $match: { productCount: { $gt: 0 } } }  // ← GATE
]);
```

### 2. Pincode Resolution
```javascript
// Backend: pincodeToState.js
pincodeToState('302001') → 'Rajasthan'
pincodeToState('600001') → 'Tamil Nadu'
pincodeToState('110001') → 'Delhi'
```

### 3. Frontend Merge
```javascript
// Frontend: data.js
const realSellers = await fetchRealSellers();  // API call
SELLERS = [...realSellers, ...MOCK_SELLERS];   // Real first
rebuildSellersByState();                       // Update map data
```

### 4. Graceful Fallback
```javascript
// Frontend: data.js
async function fetchRealSellers() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/mai/sellers`);
    if (!response.ok) return [];  // ← Fallback to []
    return data.sellers;
  } catch (error) {
    console.warn('Backend unavailable, using mock data only');
    return [];  // ← Show mock sellers only
  }
}
```

## State Management

```
┌─────────────────────────────────────────────┐
│ Global State (MAI Frontend)                 │
├─────────────────────────────────────────────┤
│ SELLERS          Array    All sellers       │
│ SELLERS_BY_STATE Object   Grouped by state  │
│ currentSeller    Object   Selected seller   │
│ activeFilters    Set      Active craft tags │
├─────────────────────────────────────────────┤
│ Functions:                                  │
│ • initializeSellers()  Fetch + merge        │
│ • rebuildSellersByState()  Group sellers    │
│ • sellerMatchesFilter()  Filter logic       │
│ • renderAllSellersList()  List view         │
│ • renderMapBadges()  State counts           │
└─────────────────────────────────────────────┘
```

## Security Considerations

```
┌─────────────────────────────────────────────┐
│ Data Validation                             │
├─────────────────────────────────────────────┤
│ ✅ Pincode: Must be 6 digits                │
│ ✅ State: Must resolve to valid state       │
│ ✅ Products: Must exist (count > 0)         │
│ ✅ Images: Served from /uploads only        │
│ ✅ CORS: Configured for allowed origins     │
└─────────────────────────────────────────────┘
```

## Performance Notes

- **Backend aggregation**: O(n) where n = number of sellers with products
- **Frontend merge**: O(1) concatenation, O(n log n) for state grouping
- **No pagination**: All sellers loaded at once (acceptable for prototype)
- **Image lazy loading**: Used in MAI for performance
- **API caching**: Not implemented (future enhancement)

## Error Handling

```
Backend API Error
       │
       ├──→ 500: Server error → Frontend shows mock data only
       ├──→ 404: Not found → Empty sellers array
       └──→ Network error → Caught, logged, fallback to mock
```

⭐ = New or modified component
✅ = Working feature
❌ = Not visible/available
