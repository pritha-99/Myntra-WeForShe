# Quick Start Guide: Garment Catalog Feature

## Prerequisites

- Node.js installed
- MongoDB running locally (or Atlas connection string)
- Gemini API key

## Setup (5 minutes)

### 1. Configure Environment

```bash
cd everything/backend
cp .env.example .env
```

Edit `.env` and add your Gemini API key:
```
GEMINI_API_KEY=your_actual_key_here
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/bharat_onboarding
```

### 2. Install Dependencies (if needed)

```bash
# Backend
cd everything/backend
npm install

# Frontend
cd everything/frontend
npm install
```

### 3. Start MongoDB

```bash
# If using local MongoDB
mongod
```

### 4. Start Backend Server

```bash
cd everything/backend
npm run dev
```

Should see:
```
✅ MongoDB connected
🚀 Server running on port 4000
```

### 5. Start Frontend Dev Server

```bash
cd everything/frontend
npm run dev
```

Should see:
```
VITE ready in XXXms
➜ Local: http://localhost:5173/
```

## Testing the Feature

### Option 1: Quick Verification Test

Run the compliance validation test:

```bash
cd everything/backend
node test-catalog-service.js
```

Should see compliance reports for all 3 stock model images.

### Option 2: Full UI Testing

1. Open browser to `http://localhost:5173`
2. Complete seller onboarding (if needed)
3. Navigate to Product Listing page
4. Fill in product details:
   - Name: "Test Kurta"
   - Price: 1299
   - Category: Select any
   - Quantity: 10
5. Upload images:
   - **Front Image**: Click and select a front garment photo
   - **Back Image**: Click and select a back garment photo
   - **Additional**: (Optional) Select up to 5 detail photos
6. Check "No price tags visible"
7. Click "Submit Listing"
8. Wait for processing (~8-10 seconds)
9. Review the catalog modal that appears

### Expected Behavior

✅ Form validation on submit
✅ Clear error if front/back missing
✅ Rejection if >5 additional images
✅ Processing indicator during upload
✅ Catalog modal shows after processing
✅ Compliance checklist visible per image
✅ Color-coded badges (green/orange/red)

## Test Images

Use these as test images:
- Front/back garment flat-lay photos from phone camera
- Ensure minimum 400px resolution
- Light background works best
- Fabric detail shots for additional images

## Troubleshooting

### Backend won't start
- Check MongoDB is running: `mongosh` or `mongo`
- Check port 4000 is available
- Verify .env file exists and has GEMINI_API_KEY

### Frontend won't start
- Check port 5173 is available
- Run `npm install` again
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Images not uploading
- Check file size <10MB
- Check format is JPEG/PNG
- Check uploads directory exists: `mkdir -p everything/backend/uploads`
- Verify backend is running and accessible

### Compliance validation fails
- Check image resolution ≥400px on shortest side
- Verify file is not corrupted
- Run test script: `node test-catalog-service.js`

### Modal not showing
- Open browser console (F12) for errors
- Check backend response in Network tab
- Verify garmentCatalog object in response

## API Testing with cURL

Test the endpoint directly:

```bash
curl -X POST http://localhost:4000/api/products \
  -F "sellerId=test123" \
  -F "name=Test Kurta" \
  -F "price=1299" \
  -F "category=Kurtas & Suits" \
  -F "quantity=10" \
  -F "frontImage=@/path/to/front.jpg" \
  -F "backImage=@/path/to/back.jpg" \
  -F "priceTagConfirmed=true"
```

## Quick Checks

```bash
# Backend syntax check
cd everything/backend
node --check src/services/garmentCatalogService.js
node --check src/routes/products.js

# Test compliance service
node test-catalog-service.js

# Frontend build test
cd everything/frontend
npx vite build
```

All should pass without errors.

## Demo Script (For Judges)

1. **Show the upload form**
   - Point out required front/back slots
   - Point out optional additional images (max 5)
   - Show price tag confirmation

2. **Upload test garment**
   - Use real garment photos
   - Submit and show processing

3. **Show catalog modal**
   - Highlight 3 on-model views (front/side/back)
   - Show compliance checklist
   - Explain color-coded badges

4. **Show error handling**
   - Try uploading without back image
   - Show clear error message

5. **Show marketplace**
   - Navigate to customer storefront
   - Show product with on-model images

## Support Files

- `IMPLEMENTATION_SUMMARY.md` - What was built
- `everything/CATALOG_FEATURE_README.md` - Complete documentation
- `implementation_plan.md` - Technical architecture
- `PRD_garment_catalog_automation_v2.md` - Requirements

## Production Deployment

When ready for production:

1. Set production MongoDB URI in .env
2. Configure Imagen API (replace Gemini placeholder)
3. Set up BiRefNet for better background removal
4. Configure static file serving (uploads directory)
5. Set up SSL certificates
6. Configure CORS for production domain
7. Set up CDN for image delivery
8. Implement image caching layer

## Quick Reference

| Task | Command |
|------|---------|
| Start backend | `cd everything/backend && npm run dev` |
| Start frontend | `cd everything/frontend && npm run dev` |
| Run tests | `cd everything/backend && node test-catalog-service.js` |
| Check syntax | `node --check src/services/garmentCatalogService.js` |
| Build frontend | `cd everything/frontend && npx vite build` |

---

**You're all set!** The garment catalog generation feature is ready to demo. 🚀
