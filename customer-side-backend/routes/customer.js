const express = require('express');
const router = express.Router();
const Seller = require('../models/Seller');
const Product = require('../models/Product');

/**
 * GET /api/customer/sellers-grouped
 * Returns all approved sellers grouped by state.
 */
router.get('/sellers-grouped', async (req, res) => {
  try {
    const sellers = await Seller.find({ status: { $in: ['approved', 'submitted'] } })
      .select('sellerId brandName brandUsp categoryTypes avgSellingPrice avgMrp ecoTags state warehouse founderFirstName founderLastName')
      .sort({ state: 1, brandName: 1 })
      .lean();

    const grouped = {};
    for (const s of sellers) {
      const state = s.state || 'Other';
      if (!grouped[state]) grouped[state] = [];
      grouped[state].push({
        sellerId:        s.sellerId,
        brandName:       s.brandName,
        brandUsp:        s.brandUsp,
        categoryTypes:   s.categoryTypes || [],
        avgSellingPrice: s.avgSellingPrice,
        avgMrp:          s.avgMrp,
        ecoTags:         s.ecoTags || [],
        city:            s.warehouse?.address || '',
        founderName:     `${s.founderFirstName || ''} ${s.founderLastName || ''}`.trim(),
        state,
      });
    }

    return res.json({ grouped, totalSellers: sellers.length });
  } catch (err) {
    console.error('sellers-grouped error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch sellers.' });
  }
});

/**
 * GET /api/customer/sellers/:sellerId
 * Returns a single approved seller's profile.
 */
router.get('/sellers/:sellerId', async (req, res) => {
  try {
    const seller = await Seller.findOne({
      sellerId: req.params.sellerId,
      status: { $in: ['approved', 'submitted'] },
    })
      .select('sellerId brandName brandUsp categoryTypes avgSellingPrice avgMrp ecoTags state warehouse founderFirstName founderLastName companyName')
      .lean();

    if (!seller) return res.status(404).json({ error: 'Seller not found.' });

    return res.json({
      sellerId:        seller.sellerId,
      brandName:       seller.brandName,
      brandUsp:        seller.brandUsp,
      categoryTypes:   seller.categoryTypes || [],
      avgSellingPrice: seller.avgSellingPrice,
      avgMrp:          seller.avgMrp,
      ecoTags:         seller.ecoTags || [],
      city:            seller.warehouse?.address || '',
      state:           seller.state,
      founderName:     `${seller.founderFirstName || ''} ${seller.founderLastName || ''}`.trim(),
      companyName:     seller.companyName,
    });
  } catch (err) {
    console.error('seller detail error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch seller.' });
  }
});

/**
 * GET /api/customer/sellers/:sellerId/products
 * Returns all products for a given seller.
 */
router.get('/sellers/:sellerId/products', async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.params.sellerId })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ products });
  } catch (err) {
    console.error('seller products error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch products.' });
  }
});

module.exports = router;
