const express = require('express');
const router = express.Router();
const Seller = require('../models/Seller');

/**
 * POST /api/seller/submit
 * Accepts a full onboarding submission, writes to MongoDB, returns a sellerId.
 *
 * Body: all explicit seller fields from the onboarding manifest + language
 * Response: { sellerId }
 */
router.post('/submit', async (req, res) => {
  const {
    language = 'en',
    // Part 1 — Registration
    phone, email, gstin,
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

    await seller.save(); // pre-save hook resolves state from warehouse.pincode
    return res.status(201).json({ sellerId });
  } catch (err) {
    console.error('Seller submit error:', err.message);
    return res.status(500).json({ error: 'Failed to save seller data.' });
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
    const seller = await Seller.findOne({ sellerId: req.params.sellerId }).lean();
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
