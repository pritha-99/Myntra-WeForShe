# Quick Start Guide - MAI Real Sellers Integration

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js and npm installed
- MongoDB running locally (`mongodb://127.0.0.1:27017`)

### Step 1: Install Dependencies

```bash
# Backend
cd everything/backend
npm install

# Frontend (React dashboard)
cd ../frontend
npm install
```

### Step 2: Start MongoDB
```bash
# If not already running:
mongod --dbpath /path/to/your/data
```

### Step 3: Seed Test Data (Optional)
```bash
cd everything/backend
node test-seed-seller.js
```

This creates a sample seller with products for testing.

### Step 4: Start Backend
```bash
cd everything/backend
npm start
```

You should see:
```
✅ Bharat Onboarding backend running on http://localhost:4000
🍃 MongoDB connected: mongodb://127.0.0.1:27017/bharat_onboarding
```

### Step 5: Test the Integration

#### Option A: Command Line Test
```bash
./test-mai-integration.sh
```

#### Option B: Browser Test
Open `MYNTRA-CUSTOMER-SIDE/made-across-india/index.html` in your browser.

Check the browser console - you should see:
```
📍 Loaded 1 real sellers + 12 mock sellers = 13 total
```

### Step 6: View Dashboard
```bash
cd everything/frontend
npm run dev
```

Navigate to `http://localhost:5173/dashboard` and click "My Story" in the nav.

## ✅ Verification Checklist

- [ ] Backend running on port 4000
- [ ] MongoDB connected
- [ ] API returns sellers: `curl http://localhost:4000/api/mai/sellers`
- [ ] MAI map shows real sellers (browser console confirms)
- [ ] Dashboard "My Story" page accessible
- [ ] Real seller products display in catalogue

## 📋 Test Scenarios

### Scenario 1: Complete Onboarding Flow
1. Go to `http://localhost:5173` (frontend)
2. Complete onboarding form
3. Note your Seller ID
4. Go to Product Listing page
5. Add a product
6. Open MAI (`made-across-india/index.html`)
7. Your seller should appear on the map!

### Scenario 2: API Testing
```bash
# Get all MAI sellers
curl http://localhost:4000/api/mai/sellers | jq

# Get specific seller
curl http://localhost:4000/api/mai/sellers/SLR-ABC123 | jq

# Get seller's products
curl http://localhost:4000/api/products/SLR-ABC123 | jq
```

### Scenario 3: Map Interaction
1. Open `made-across-india/index.html`
2. Click on a highlighted state
3. See list of sellers (real + mock)
4. Click on a real seller
5. View their catalogue with real products
6. Click on a product to see PDP

## 🐛 Common Issues

### "No real sellers appearing"
**Cause**: No sellers have products yet  
**Solution**: Run `node test-seed-seller.js` or complete full onboarding + product listing

### "Backend unavailable" in console
**Cause**: Backend not running  
**Solution**: Start backend with `npm start` in `everything/backend`

### "State not highlighting"
**Cause**: Pincode doesn't resolve to valid state  
**Solution**: Use valid Indian pincodes (e.g., 302001 for Rajasthan)

### "Products not showing images"
**Cause**: Images not uploaded or path incorrect  
**Solution**: Check `everything/backend/uploads/` folder exists and has images

## 🎯 Quick Demo Script

Perfect for showing the integration to others:

```bash
# Terminal 1: Start backend
cd everything/backend && npm start

# Terminal 2: Run test
./test-mai-integration.sh

# Terminal 3: Start dashboard
cd everything/frontend && npm run dev

# Browser 1: Open MAI
# Open MYNTRA-CUSTOMER-SIDE/made-across-india/index.html

# Browser 2: Open Dashboard
# Go to http://localhost:5173/dashboard
```

Then demonstrate:
1. **Dashboard**: Show "My Story" coming soon page
2. **Product Listing**: Add a new product
3. **MAI Map**: Refresh and show new seller appears
4. **Catalogue**: Click seller to see their products
5. **Filters**: Use craft filters to find sellers

## 📚 Next Steps

- Read `MAI_INTEGRATION_README.md` for detailed documentation
- Review `IMPLEMENTATION_SUMMARY.md` for technical overview
- Check `PRD_MAI_Real_Sellers_Integration.md` for requirements

## 🔗 Key URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Backend API | http://localhost:4000 | REST API server |
| Dashboard | http://localhost:5173 | Seller portal |
| MAI Frontend | file:///.../index.html | Customer map |
| API Health | http://localhost:4000/api/health | Server status |
| MAI Sellers | http://localhost:4000/api/mai/sellers | Real sellers API |

## 🎉 Success!

If you can see real sellers on the MAI map and their products in the catalogue, the integration is working correctly!

For issues or questions, refer to the troubleshooting section above or check the detailed docs.
