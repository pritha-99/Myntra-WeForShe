const express = require('express');
const router = express.Router();
const Seller = require('../models/Seller');

/**
 * POST /api/seller/submit
 * Accepts a full onboarding submission, writes to MongoDB, returns a sellerId.
 *
 * Body: all explicit seller fields from the onboarding manifest + language + password
 * Response: { sellerId }
 */
router.post('/submit', async (req, res) => {
  const {
    language = 'en',
    // Part 1 — Registration
    phone, email, gstin, password,
    companyName, pan, gstState,
    founderFirstName, founderLastName,
    signaturePath,
    // Part 2A — Basic Information
    primaryContactIsOwner, businessOwnerIsRegistrant,
    existingMyntraPartner, entityType,
    tdsOptional, tanNumber,
    // Part 2B — Business Details
    omsChoice, operationalReadiness,
    // Part 2C — Warehouse
    warehouse,
    // Part 2D — Bank Details
    bank,
    // Part 2E — Brand Details
    brandName, natureOfBusiness, trademarkProofPath,
    avgMrp, avgSellingPrice, brandUsp, ecoTags,
    // Part 2F — Category & Sizing
    categoryTypes,
    // Part 2G — Online Presence
    sellsElsewhere,
    // Part 2H — APOB
    apobNeeded,
  } = req.body;

  // Guard against double-submission: check if a seller with the same email or
  // GSTIN already exists (handles React Strict Mode double-render and network retries).
  try {
    const dedupeQuery = [];
    if (email) dedupeQuery.push({ email });
    if (gstin) dedupeQuery.push({ gstin });

    if (dedupeQuery.length > 0) {
      const existing = await Seller.findOne({ $or: dedupeQuery });
      if (existing) {
        // Return the existing sellerId so the frontend session is set correctly.
        console.log(`[seller/submit] Duplicate detected for email=${email} gstin=${gstin} — returning existing sellerId ${existing.sellerId}`);
        return res.status(200).json({ sellerId: existing.sellerId });
      }
    }

    // Generate a human-friendly seller ID: SLR-<random 6 chars>
    const randomPart = Math.random().toString(36).toUpperCase().slice(2, 8);
    const sellerId = `SLR-${randomPart}`;

    const seller = new Seller({
      sellerId,
      language,
      phone,
      email,
      gstin,
      password,   // will be hashed by pre-save hook
      companyName,
      pan,
      gstState,
      founderFirstName,
      founderLastName,
      signaturePath,
      primaryContactIsOwner,
      businessOwnerIsRegistrant,
      existingMyntraPartner,
      entityType,
      tdsOptional,
      tanNumber,
      omsChoice,
      operationalReadiness,
      warehouse,
      bank,
      brandName,
      natureOfBusiness,
      trademarkProofPath,
      avgMrp,
      avgSellingPrice,
      brandUsp,
      ecoTags,
      categoryTypes,
      sellsElsewhere,
      apobNeeded,
      status: 'submitted',
    });

    await seller.save(); // pre-save hook hashes password & resolves state
    return res.status(201).json({ sellerId });
  } catch (err) {
    console.error('Seller submit error:', err.message);
    return res.status(500).json({ error: 'Failed to save seller data.' });
  }
});

/**
 * POST /api/seller/login
 * Validates business email + password against stored seller records.
 *
 * Body: { email, password }
 * Response (200): { sellerId, brandName, companyName, status, email }
 * Response (401): { error: 'Invalid credentials.' }
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // Find seller by email (case-insensitive due to lowercase: true on schema)
    const seller = await Seller.findOne({ email: email.toLowerCase().trim() });

    if (!seller) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Legacy accounts (created before password field was added) have no stored password.
    // Allow them in so existing sellers are not locked out.
    if (seller.password) {
      const isMatch = await seller.verifyPassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }
    }
    // If seller.password is null/undefined → legacy account, skip password check.

    // Return non-sensitive seller info
    return res.json({
      sellerId:    seller.sellerId,
      brandName:   seller.brandName || seller.companyName || '',
      companyName: seller.companyName || '',
      status:      seller.status,
      email:       seller.email,
      founderFirstName: seller.founderFirstName || '',
      founderLastName:  seller.founderLastName  || '',
    });
  } catch (err) {
    console.error('Seller login error:', err.message);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

const multer = require('multer');
const path = require('path');
const Story = require('../models/Story');

// Storage config for story image uploads
const storyStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `story-${uniqueSuffix}${ext}`);
  },
});

const storyUpload = multer({
  storage: storyStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase())
                && allowed.test(file.mimetype);
    if (ok) cb(null, true);
    else cb(new Error('Only image files are allowed.'));
  },
});

/**
 * POST /api/seller/story/upload
 * Upload story images (up to 5)
 */
router.post('/story/upload', storyUpload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files provided.' });
    }
    const fileUrls = req.files.map(f => `/uploads/${f.filename}`);
    return res.json({ urls: fileUrls });
  } catch (err) {
    console.error('Story upload error:', err.message);
    return res.status(500).json({ error: 'Failed to upload story images.' });
  }
});

/**
 * GET /api/seller/story/:sellerId
 * Fetch story for given seller
 */
router.get('/story/:sellerId', async (req, res) => {
  try {
    const story = await Story.findOne({ 
      $or: [{ sellerId: req.params.sellerId }, { gstin: req.params.sellerId }] 
    }).lean();
    return res.json({ story: story || null });
  } catch (err) {
    console.error('Fetch story error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch story.' });
  }
});

/**
 * POST /api/seller/story
 * Save or update story for seller
 */
router.post('/story', async (req, res) => {
  try {
    const { sellerId, gstin, title, description, images } = req.body;
    if (!sellerId) {
      return res.status(400).json({ error: 'sellerId is required.' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Story description is required.' });
    }
    if (Array.isArray(images) && images.length > 5) {
      return res.status(400).json({ error: 'Maximum 5 images allowed for My Story.' });
    }

    const story = await Story.findOneAndUpdate(
      { $or: [{ sellerId }, { gstin: gstin || sellerId }] },
      {
        sellerId,
        gstin: gstin || sellerId,
        title: title || 'My Craft Story',
        description: description.trim(),
        images: images || [],
      },
      { new: true, upsert: true, runValidators: true }
    );

    return res.json({ message: 'Story saved successfully', story });
  } catch (err) {
    console.error('Save story error:', err.message);
    return res.status(500).json({ error: err.message || 'Failed to save story.' });
  }
});

/**
 * GET /api/seller/:sellerId
 * Fetch a single seller record (used by dashboard to greet the seller).
 *
 * Response: { sellerId, brandName, state, status, createdAt, ... }
 */
router.get('/:sellerId', async (req, res) => {
  try {
    const seller = await Seller.findOne({ sellerId: req.params.sellerId })
      .select('-password')   // never expose the hashed password
      .lean();
    if (!seller) {
      return res.status(404).json({ error: 'Seller not found.' });
    }
    return res.json(seller);
  } catch (err) {
    console.error('Seller fetch error:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve seller.' });
  }
});

module.exports = router;

