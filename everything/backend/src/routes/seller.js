const express = require('express');
const router = express.Router();
const Seller = require('../models/Seller');

/**
 * POST /api/seller/submit
 * Accepts a full onboarding submission, writes to MongoDB, returns a sellerId.
 *
 * Body: { answers: object, language: 'en'|'ta'|'hi' }
 * Response: { sellerId: string }
 */
router.post('/submit', async (req, res) => {
  const { answers = {}, language = 'en' } = req.body;

  // Generate a human-friendly seller ID: SLR-<random 6 chars>
  const randomPart = Math.random().toString(36).toUpperCase().slice(2, 8);
  const sellerId = `SLR-${randomPart}`;

  try {
    const seller = new Seller({
      sellerId,
      answers,
      language,
      status: 'submitted',
    });
    await seller.save();
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
 * Response: { sellerId, answers, language, status, createdAt }
 */
router.get('/:sellerId', async (req, res) => {
  try {
    const seller = await Seller.findOne({ sellerId: req.params.sellerId }).lean();
    if (!seller) {
      return res.status(404).json({ error: 'Seller not found.' });
    }
    return res.json({
      sellerId: seller.sellerId,
      answers: seller.answers,
      language: seller.language,
      status: seller.status,
      createdAt: seller.createdAt,
    });
  } catch (err) {
    console.error('Seller fetch error:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve seller.' });
  }
});

module.exports = router;
