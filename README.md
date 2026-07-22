# Myntra WeForShe — Hackathon Project

> **Audio-first seller onboarding + customer marketplace for empowering women artisans across India**  
> Built for the Myntra WeForShe Hackathon

---

## 📋 Project Overview

This project consists of two main applications that work together to create an ecosystem supporting women-led artisan businesses:

### 1. **Seller Onboarding Platform** (`everything/`)
An audio-first, multilingual onboarding system designed for low-literacy sellers in Tier 2/3 India. Features a tile-based UI with voice guidance in English, Hindi, and Tamil.

### 2. **Customer Marketplace** (`customer-side-*/`)
A consumer-facing platform where customers can discover and shop from women-led artisan brands, organized by Indian states and craft types.

---

## 🏗️ Architecture

```
Myntra-WeForShe/
│
├── everything/                          # Seller onboarding application
│   ├── frontend/                        # React + Vite + Tailwind UI
│   │   └── 40-question manifest-driven onboarding flow
│   └── backend/                         # Node.js + Express + MongoDB + Gemini AI
│       └── Validation, explanation, chat, seller/product APIs
│
├── customer-side-react/                 # Customer marketplace frontend
│   └── React + Vite + Tailwind + React Router
│       └── Browse sellers by state, view storefronts
│
└── customer-side-backend/               # Customer marketplace backend
    └── Node.js + Express + MongoDB
        └── Seller & product listing APIs
```

---

## 🚀 Technology Stack

### Frontend
- **React 19** with Vite
- **Tailwind CSS 4** for styling
- **React Router** for navigation

### Backend
- **Node.js** with Express
- **MongoDB** (via Mongoose)
- **Google Gemini AI** for intelligent explanations and chat
- **Multer** for file uploads (product images, documents)

### APIs & Services
- Text-to-Speech (TTS) and Speech-to-Text (STT) integration points
- Pincode and IFSC code lookup utilities
- Real-time validation services

---

## 📦 Prerequisites

Before running this project, ensure you have:

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **MongoDB** (local installation or Atlas cloud account)
- **Google Gemini API Key** (for AI-powered features)

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone <your-repo-url>
cd Myntra-WeForShe
```

### 2️⃣ Setup Seller Onboarding Platform

#### Backend Setup

```bash
cd everything/backend
npm install
```

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Google Gemini API Key (required for AI features)
GEMINI_API_KEY=your_gemini_api_key_here

# Server port
PORT=4000

# MongoDB connection string
# For local MongoDB:
MONGODB_URI=mongodb://127.0.0.1:27017/bharat_onboarding

# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/bharat_onboarding
```

#### Frontend Setup

```bash
cd everything/frontend
npm install
```

### 3️⃣ Setup Customer Marketplace

#### Backend Setup

```bash
cd customer-side-backend
npm install
```

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# MongoDB connection string (same database as seller onboarding)
MONGODB_URI=mongodb://127.0.0.1:27017/bharat_onboarding

# Server port (different from seller backend)
PORT=4001
```

#### Frontend Setup

```bash
cd customer-side-react
npm install
```

---

## 🎬 Running the Application

You need to run **4 servers** simultaneously in separate terminal windows:

### Terminal 1: Seller Onboarding Backend

```bash
cd everything/backend
npm run dev
```

✅ Runs on **http://localhost:4000**

### Terminal 2: Seller Onboarding Frontend

```bash
cd everything/frontend
npm run dev
```

✅ Runs on **http://localhost:5173**  
🔗 Proxies `/api/*` requests to `http://localhost:4000`

### Terminal 3: Customer Marketplace Backend

```bash
cd customer-side-backend
npm run dev
```

✅ Runs on **http://localhost:4001**

### Terminal 4: Customer Marketplace Frontend

```bash
cd customer-side-react
npm run dev
```

✅ Runs on **http://localhost:5174**  
🔗 Connects to backend at `http://localhost:4001`

---

## 🗄️ Database Setup

### Option 1: Local MongoDB

1. Install MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```
3. Use the local URI: `mongodb://127.0.0.1:27017/bharat_onboarding`

### Option 2: MongoDB Atlas (Cloud)

1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Add a database user
4. Whitelist your IP address
5. Get your connection string and update `.env` files

### Seed Test Data (Optional)

To populate the database with sample sellers and products:

```bash
cd everything/backend
npm run seed:test-seller
```

---

## 📱 Application Features

### Seller Onboarding Platform

#### Core Features
- **40-question guided onboarding** flow
- **Audio-first interface** with TTS/STT support
- **Multilingual** (English, Tamil, Hindi)
- **Tile-based input** for low-literacy users
- **AI-powered help** using Google Gemini
- **Document upload** (GST, bank cheque, trademark)
- **Real-time validation** (phone, GST, IFSC)

#### Key Onboarding Sections
1. **Registration** — Phone, email, GST verification
2. **Basic Information** — Contact details, entity type
3. **Business Details** — OMS choice, operational readiness
4. **Warehouse** — Location, capacity, pickup hours
5. **Bank Details** — Account information with validation
6. **Brand Details** — Brand name, USP, pricing, eco-tags
7. **Category & Sizing** — Product types and catalog setup
8. **Online Presence** — Existing marketplace listings
9. **APOB** — Article purchase order book requirements

#### API Endpoints

**Validation:**
- `POST /api/validate` — Validate phone, GST, IFSC, password

**AI Explanations:**
- `POST /api/explain` — Get Gemini-powered explanations in any language
- `POST /api/chat` — Interactive chat for field-specific help

**Lookups:**
- `GET /api/lookup/pincode/:pincode` — Get city/state from pincode
- `GET /api/lookup/ifsc/:code` — Get bank details from IFSC

**Seller Management:**
- `POST /api/seller/submit` — Submit seller onboarding data
- `GET /api/seller/:id` — Retrieve seller profile
- `PATCH /api/seller/:id` — Update seller information

**Product Management:**
- `POST /api/products` — Create product with image upload
- `GET /api/products/:id` — Get product details
- `GET /api/products/seller/:sellerId` — List all products for a seller

### Customer Marketplace

#### Core Features
- **State-based browsing** — Sellers organized by Indian state
- **Accordion interface** — Expandable state sections
- **Search functionality** — Find brands, crafts, states
- **Seller storefronts** — Dedicated pages for each artisan
- **Product catalogs** — Browse products with images
- **Brand storytelling** — USP and founder information

#### API Endpoints

**Customer APIs:**
- `GET /api/customer/sellers-grouped` — Get all sellers grouped by state
- `GET /api/customer/sellers/:sellerId` — Get seller profile
- `GET /api/customer/sellers/:sellerId/products` — Get products for a seller

---

## 🧪 Testing

### Test Values for Seller Onboarding

#### Valid Phone Numbers
Any 10-digit number starting with 6–9:
- `9876543210`
- `8765432109`

#### Valid GST Numbers
- `29ABCDE1234F1Z5` (Karnataka)
- Any 15-character code matching format: `^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`

#### Valid IFSC Codes
| Code | Bank | Branch |
|------|------|--------|
| `SBIN0001234` | State Bank of India | MG Road Bengaluru |
| `HDFC0000001` | HDFC Bank | Fort Mumbai |
| `ICIC0000001` | ICICI Bank | Bandra Mumbai |
| `KKBK0000001` | Kotak Mahindra Bank | Chennai Branch |
| `PUNB0001000` | Punjab National Bank | Connaught Place New Delhi |

#### Pincode Lookups
| Pincode | City | State |
|---------|------|-------|
| `560001` | Bengaluru | Karnataka |
| `400001` | Mumbai | Maharashtra |
| `110001` | New Delhi | Delhi |
| `600001` | Chennai | Tamil Nadu |
| `500001` | Hyderabad | Telangana |
| `302001` | Jaipur | Rajasthan |

---

## 🎨 Project Structure Details

### Seller Onboarding (`everything/`)

```
everything/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── QuestionScreen.jsx      # Generic question renderer
│   │   │   └── inputs/                  # All input types (tiles, voice, etc.)
│   │   ├── data/
│   │   │   └── manifest.sample.json     # 40-question onboarding manifest
│   │   ├── api/
│   │   │   ├── sttProvider.js           # Speech-to-text
│   │   │   └── ttsProvider.js           # Text-to-speech
│   │   └── App.jsx                      # Main routing
│   └── package.json
│
└── backend/
    ├── src/
    │   ├── models/
    │   │   ├── Seller.js                # Comprehensive seller schema
    │   │   └── Product.js               # Product catalog schema
    │   ├── routes/
    │   │   ├── validate.js              # Input validation
    │   │   ├── explain.js               # Gemini explanations
    │   │   ├── chat.js                  # AI chat support
    │   │   ├── seller.js                # Seller CRUD
    │   │   └── products.js              # Product CRUD
    │   ├── docs/
    │   │   └── content/field/           # Field-specific help docs
    │   ├── validators/                  # Validation logic
    │   └── server.js                    # Main server
    └── package.json
```

### Customer Marketplace

```
customer-side-react/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx                   # Navigation header
│   │   ├── StateAccordion.jsx           # State-based grouping
│   │   ├── SellerCard.jsx               # Seller preview cards
│   │   └── ProductCard.jsx              # Product display cards
│   ├── pages/
│   │   ├── HomePage.jsx                 # Browse all sellers
│   │   └── StorefrontPage.jsx           # Individual seller storefront
│   ├── api/
│   │   └── client.js                    # API client
│   └── App.jsx
└── package.json

customer-side-backend/
├── models/
│   ├── Seller.js                        # Seller model (customer view)
│   └── Product.js                       # Product model
├── routes/
│   └── customer.js                      # Customer-facing APIs
├── utils/
│   └── pincodeToState.js                # Pincode utility
└── server.js
```

---

## 🔧 Configuration Notes

### Shared MongoDB Database

Both applications share the same MongoDB database (`bharat_onboarding`) to ensure:
- Sellers onboarded through the seller platform appear in the customer marketplace
- Product catalogs are synchronized
- Real-time updates across both systems

### Port Configuration

- **Seller Backend:** Port 4000
- **Customer Backend:** Port 4001  
- **Seller Frontend:** Port 5173 (Vite default)
- **Customer Frontend:** Port 5174 (Vite auto-increments)

### API Proxying

Both frontends use Vite's proxy configuration to forward API requests to their respective backends, avoiding CORS issues during development.

---

## 🌐 Multilingual Support

The seller onboarding platform supports:
- **English (en)** — Default
- **Tamil (ta)** — For Tamil Nadu artisans
- **Hindi (hi)** — For Hindi-speaking regions

Language can be switched from the header at any time. All help docs, explanations, and audio prompts adapt to the selected language using Google Gemini AI.

---

## 🤖 AI Features

### Google Gemini Integration

The seller onboarding platform uses Gemini 2.0 Flash for:

1. **Field Explanations** — Context-aware help for complex fields (GST, IFSC, APOB)
2. **Interactive Chat** — Answer seller questions in real-time
3. **Multilingual Translation** — Dynamically translate content to Tamil/Hindi
4. **Voice Input Processing** — Interpret voice responses for open-ended fields

### Configuring Gemini

1. Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to `everything/backend/.env`:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

---

## 📸 File Uploads

The seller onboarding backend supports file uploads for:
- Product images (via `/api/products`)
- GST certificate
- Bank cheque copy
- Trademark proof
- Digital signature

Uploaded files are stored in `everything/backend/uploads/` and served statically via `/uploads/*`.

---

## 🐛 Troubleshooting

### Backend won't start

**Error:** `MongoDB connection failed`

**Solution:** 
- Check MongoDB is running: `brew services list` (macOS) or `sudo systemctl status mongod` (Linux)
- Verify `MONGODB_URI` in `.env` files
- For Atlas, check your IP is whitelisted

### Frontend can't connect to backend

**Error:** `Failed to fetch` or `CORS error`

**Solution:**
- Ensure backend is running on the correct port
- Check Vite proxy configuration in `vite.config.js`
- Verify `cors()` middleware is enabled in backend

### Gemini API errors

**Error:** `GEMINI_API_KEY not found` or `401 Unauthorized`

**Solution:**
- Verify API key in `everything/backend/.env`
- Check key validity at [Google AI Studio](https://makersuite.google.com/)
- Ensure no spaces or quotes around the key

### Port already in use

**Error:** `EADDRINUSE: address already in use :::4000`

**Solution:**
- Kill the process: `lsof -ti:4000 | xargs kill` (macOS/Linux)
- Or change the port in `.env`: `PORT=4002`

---

## 🎯 Key Use Cases

### For Artisan Sellers
1. Complete multilingual onboarding in 20-30 minutes
2. Get AI-powered help for complex business questions
3. Upload product catalog with images
4. Manage brand profile and warehouse details

### For Customers
1. Discover women-led artisan brands by state
2. Learn about traditional Indian crafts
3. Support local artisans directly
4. Browse product catalogs with authentic stories

---

## 📚 Additional Resources

### API Documentation

Detailed API documentation is available in:
- `everything/README.md` — Seller onboarding APIs
- Backend route files for inline documentation

### Manifest Customization

To add new onboarding questions:
1. Edit `everything/frontend/src/data/manifest.sample.json`
2. Add validation logic to `everything/backend/src/validators/`
3. Add help docs to `everything/backend/src/docs/content/field/`

No component code changes required — the UI is fully manifest-driven!

---

## 👥 Contributing

This is a hackathon prototype. Future enhancements could include:
- Payment gateway integration
- Order management system
- Real-time inventory tracking
- Customer reviews and ratings
- WhatsApp/SMS notifications
- Multilingual customer marketplace
- Analytics dashboard for sellers

---

## 📄 License

This project was built for the Myntra WeForShe Hackathon.

---

## 🙏 Acknowledgments

- **Myntra** for the WeForShe initiative
- **Google Gemini AI** for multilingual support
- **MongoDB** for database infrastructure
- All the women artisans who inspire this platform

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the existing README files in subdirectories
3. Examine the API endpoint documentation in route files

---

**Built with ❤️ to empower women artisans across India**
