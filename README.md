# Myntra WeForShe — Hackathon Project

> **Audio-first, Multilingual and Chatbot supported seller onboarding, automated garment cataloging and customer marketplace empowering artisans across India.**  
> Built for the Myntra WeForShe Hackathon by Team Frootloops

---

## 📋 Project Overview

This project provides an end-to-end ecosystem connecting Tier 2/3 artisans with nationwide customers through two primary applications:

### 1. **Seller Portal** (`Seller Portal/`)
An audio-first, multilingual onboarding system and seller management suite designed for low-literacy sellers in Tier 2/3 India.
- **Multilingual Support**: Questions can be read and answered in English, Hindi, or Tamil.
- **Mia AI Assistant**: Powered by Google Gemini 2.5 Flash for real-time field help, voice input interpretation, and interactive chat.
- **Automated Garment Cataloging**: On-model generation pipeline powered by Replicate AI's **FLUX Kontext Pro (`black-forest-labs/flux-kontext-pro`)** model. Converts seller flat-lay product photos into high-quality, photorealistic on-model studio photos across Front and Back poses while preserving all fabric details, textures, logos, and seams.
- **E-Commerce Compliance Engine**: Automatic validation of image dimensions (1080×1440), 3:4 aspect ratio, background neutrality, blur detection, and file size checks.
- **My Craft Journey**: Storytelling module for artisans to document their craft origins, heritage, and upload photo galleries.

### 2. **Customer Marketplace** (`Customer Side/`)
A consumer marketplace allowing shoppers to discover women-led artisan brands, explore traditional crafts, and buy directly from sellers.
- **Made Across India Interactive Map**: Visual SVG map of India for state-by-state artisan discovery.
- **State-Based Grouping**: Expandable state accordions organizing sellers by geographic craft hubs.
- **Artisan Storefronts & Story Modals**: Dedicated brand pages with USP badges, eco-responsibility tags, product catalogs, and craft story galleries.
- **Product Detail Pages**: High-resolution image galleries, specifications, pricing, and seller background info.

---

## 🏗️ Architecture

```
Myntra-WeForShe/
│
├── Seller Portal/                       # Seller onboarding & management suite
│   ├── frontend/                        # React 19 + Vite + Tailwind CSS UI
│   │   ├── src/
│   │   │   ├── components/              # Audio player, QuestionScreen, MiaChat, Tile inputs
│   │   │   ├── dashboard/               # HomePage, ProductListingPage, MyStoryPage, ComingSoonPage
│   │   │   ├── data/                    # Onboarding 40-question manifest
│   │   │   └── i18n/                    # Multilingual translations (EN, HI, TA)
│   │   └── package.json
│   │
│   └── backend/                         # Node.js + Express + MongoDB + Gemini + Python AI Services
│       ├── src/
│       │   ├── models/                  # Seller, Product, Story Mongoose schemas
│       │   ├── routes/                  # validate, explain, chat, lookup, seller, products, mai
│       │   ├── services/                # garmentCatalogService.js, replicate_client.py (FLUX Kontext Pro)
│       │   └── validators/              # phone, gstin, ifsc, password, pincode logic
│       └── package.json
│
└── Customer Side/                       # Customer marketplace folder
    ├── customer-side-react/             # Customer marketplace frontend (React + Vite + Tailwind)
    │   ├── src/
    │   │   ├── components/              # IndiaMap, StateAccordion, StoreStoryModal, ProductCard
    │   │   └── pages/                   # HomePage, MapPage, StateDetailPage, StorefrontPage, ProductDetailPage
    │   └── package.json
    │
    └── customer-side-backend/           # Customer marketplace backend (Express + MongoDB)
        ├── models/                      # Seller, Product, Story schemas
        ├── routes/                      # customer.js (sellers-grouped, storefront, story, products)
        └── server.js                    # Serves product images from Seller Portal uploads
```

---

## 🚀 Technology Stack

### Frontend
- **React 19** with **Vite**
- **Tailwind CSS 4** for styling
- **React Router 7** for routing
- **Web Speech API & Custom Providers** for Text-to-Speech (TTS) and Speech-to-Text (STT)

### Backend
- **Node.js** with **Express**
- **MongoDB** (via Mongoose schemas)
- **Google Gemini 2.5 Flash AI** for context explanations, translation, and interactive assistant
- **FLUX Kontext Pro (`black-forest-labs/flux-kontext-pro` via Replicate API)** for automated on-model garment image generation
- **Sharp** for image cropping, background removal, and quality compliance checks
- **Multer** for file upload management

---

## 📦 Prerequisites

Ensure you have the following installed before setting up:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Python 3.10+** (for Replicate FLUX Kontext Pro generation scripts)
- **MongoDB** (local installation or MongoDB Atlas cloud URI)
- **Google Gemini API Key** (for AI explanations and Mia chat)
- **Replicate API Token** (required for FLUX Kontext Pro on-model generation)

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone <your-repo-url>
cd Myntra-WeForShe
```

### 2️⃣ Setup Seller Portal

#### Backend Setup

```bash
cd "Seller Portal/backend"
npm install
```

Create `.env` file in `Seller Portal/backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/bharat_onboarding
REPLICATE_API_TOKEN=your_replicate_token_here
```

#### Frontend Setup

```bash
cd "Seller Portal/frontend"
npm install
```

### 3️⃣ Setup Customer Side

#### Backend Setup

```bash
cd "Customer Side/customer-side-backend"
npm install
```

Create `.env` file in `Customer Side/customer-side-backend/.env`:

```env
PORT=4001
MONGODB_URI=mongodb://127.0.0.1:27017/bharat_onboarding
```

#### Frontend Setup

```bash
cd "Customer Side/customer-side-react"
npm install
```

---

## 🎬 Running the Application

To run the entire ecosystem, start the **4 servers** in separate terminal windows:

### Terminal 1: Seller Portal Backend
```bash
cd "Seller Portal/backend"
npm run dev
```
✅ Runs on **http://localhost:4000**

### Terminal 2: Seller Portal Frontend
```bash
cd "Seller Portal/frontend"
npm run dev
```
✅ Runs on **http://localhost:5173** (proxies `/api/*` to port `4000`)

### Terminal 3: Customer Side Backend
```bash
cd "Customer Side/customer-side-backend"
npm run dev
```
✅ Runs on **http://localhost:4001**

### Terminal 4: Customer Side Frontend
```bash
cd "Customer Side/customer-side-react"
npm run dev
```
✅ Runs on **http://localhost:5174** (proxies `/api/*` to port `4001`)

---

## 🗄️ MongoDB Setup Guide & Test Data

Both applications share the same MongoDB database (`bharat_onboarding`) so that newly onboarded sellers and products seamlessly appear on the customer marketplace.

### Setting Up MongoDB for the User

You can choose either a **local MongoDB server** or a **cloud-hosted MongoDB Atlas cluster**:

#### Option A: Local MongoDB Installation (Recommended for Offline Dev)
1. **Download & Install MongoDB Community Edition**:
   - **macOS**: `brew tap mongodb/brew && brew install mongodb-community`
   - **Linux (Ubuntu/Debian)**: `sudo apt install -y mongodb`
   - **Windows**: Download installer from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. **Start the MongoDB Service**:
   - **macOS**: `brew services start mongodb-community`
   - **Linux**: `sudo systemctl start mongod`
   - **Windows**: Run `net start MongoDB` in Administrator Command Prompt
3. **Configure Environment Variables**:
   Set `MONGODB_URI` in both `.env` files:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/bharat_onboarding
   ```

#### Option B: MongoDB Atlas (Cloud Cluster)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free `M0` cluster and create a database user (username & password).
3. Under **Network Access**, add your current IP address (or `0.0.0.0/0` for development).
4. Click **Connect** ➔ **Drivers** to copy your connection string.
5. Set `MONGODB_URI` in both `.env` files:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/bharat_onboarding?retryWrites=true&w=majority
   ```

> ⚠️ **Important Note**: Ensure both `Seller Portal/backend/.env` and `Customer Side/customer-side-backend/.env` use the **exact same `MONGODB_URI`** so data stays synchronized!

### Seed Test Data (Optional)

To populate the database with mock sellers, artisan stories, and sample products:

```bash
cd "Seller Portal/backend"
node seed-mockdata.js
```

---

## 📡 Complete API Reference

### Seller Portal Backend (Port 4000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/validate` | `POST` | Validates input format for `phone`, `gstin`, `ifsc`, `password` |
| `/api/explain` | `POST` | Fetches Gemini AI-powered field explanations in `en`, `hi`, or `ta` |
| `/api/chat` | `POST` | Real-time interactive chat assistance via Mia AI assistant |
| `/api/lookup/pincode/:pincode` | `GET` | Resolves city, state, and country from a 6-digit pincode |
| `/api/lookup/ifsc/:code` | `GET` | Resolves bank name and branch from an 11-character IFSC code |
| `/api/seller/submit` | `POST` | Submits complete 40-question seller onboarding profile |
| `/api/seller/:id` | `GET` / `PATCH` | Retrieves or updates seller profile |
| `/api/seller/story` | `POST` / `GET` | Creates or fetches an artisan's "My Craft Journey" story |
| `/api/products` | `POST` | Uploads product flat-lays, triggers FLUX Kontext Pro on-model generation via Replicate, runs e-commerce compliance checks, and creates catalog entry |
| `/api/products/:id` | `GET` | Retrieves product catalog details |
| `/api/products/seller/:sellerId` | `GET` | Retrieves all products listed by a seller |
| `/api/mai/sellers` | `GET` | Formats database sellers into Made Across India map schema |

### Customer Side Backend (Port 4001)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | `GET` | Health check endpoint returning server and DB status |
| `/api/customer/sellers-grouped` | `GET` | Returns approved sellers grouped by state for accordions |
| `/api/customer/sellers/:sellerId` | `GET` | Returns individual seller profile details |
| `/api/customer/sellers/:sellerId/products` | `GET` | Returns all products listed by a specific seller |
| `/api/customer/products/:productId` | `GET` | Returns single product details along with seller profile metadata |
| `/api/customer/sellers/:sellerId/story` | `GET` | Returns artisan craft journey story and photo gallery |
| `/uploads/*` | `GET` | Serves product images statically from `../../Seller Portal/backend/uploads` |

---

## 🧪 Testing & Verification

### Test Compliance Service
To test e-commerce image compliance checks on stock model images:
```bash
cd "Seller Portal/backend"
node test-catalog-service.js
```

### Valid Testing Inputs for Onboarding
- **Phone Number:** Any 10-digit number starting with 6–9 (e.g. `9876543210`)
- **GSTIN:** `29ABCDE1234F1Z5` or any 15-character valid GST pattern
- **IFSC Codes:** `SBIN0001234` (SBI), `HDFC0000001` (HDFC), `ICIC0000001` (ICICI)
- **Pincodes:** `560001` (Bengaluru), `400001` (Mumbai), `110001` (New Delhi), `600001` (Chennai)

---

## 👥 Acknowledgments & License

- Built for the **Myntra WeForShe Hackathon** by **Team Frootloops**.
- Powered by **Google Gemini AI**, **Replicate AI (FLUX Kontext Pro)**, **React 19**, **Vite**, **Express**, and **MongoDB**.
