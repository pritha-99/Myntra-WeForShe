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

  // Generate a human-friendly seller ID: SLR-<random 6 chars>
  const randomPart = Math.random().toString(36).toUpperCase().slice(2, 8);
  const sellerId = `SLR-${randomPart}`;

  try {
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
