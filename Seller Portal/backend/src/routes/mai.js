const express = require('express');
const router = express.Router();
const Seller = require('../models/Seller');
const Product = require('../models/Product');

/**
 * GET /api/mai/sellers
 * Returns real sellers from the database who have at least one product listed,
 * formatted to match the MAI frontend's seller schema.
 * 
 * This endpoint enables real onboarded sellers to appear on the Made Across India
 * customer-facing map alongside mock sellers.
 * 
 * Response: { sellers: [] }
 */
router.get('/sellers', async (req, res) => {
  try {
    // Step 1: Find all sellers who have at least one product
    const sellersWithProducts = await Product.aggregate([
      {
        $group: {
          _id: '$sellerId',
          productCount: { $sum: 1 },
          oldestProduct: { $min: '$createdAt' }
        }
      },
      {
        $match: {
          productCount: { $gt: 0 }
        }
      }
    ]);

    if (sellersWithProducts.length === 0) {
      return res.json({ sellers: [] });
    }

    const sellerIds = sellersWithProducts.map(s => s._id);
    
    // Step 2: Get full seller details
    const sellers = await Seller.find({ sellerId: { $in: sellerIds } }).lean();
    
    // Step 3: Get all products for these sellers
    const products = await Product.find({ sellerId: { $in: sellerIds } })
      .sort({ createdAt: -1 })
      .lean();
    
    // Group products by sellerId
    const productsBySeller = {};
    products.forEach(p => {
      if (!productsBySeller[p.sellerId]) {
        productsBySeller[p.sellerId] = [];
      }
      productsBySeller[p.sellerId].push(p);
    });

    // Step 4: Transform to MAI format
    const maiSellers = sellers.map(seller => {
      const sellerProducts = productsBySeller[seller.sellerId] || [];
      const productMeta = sellersWithProducts.find(s => s._id === seller.sellerId);

      // Read explicit fields from the new schema
      const businessName = seller.brandName || seller.companyName || 'Unnamed Business';
      const state = seller.state; // resolved + stored by pre-save hook
      // Category tags: prefer seller-declared categoryTypes, fall back to product categories
      const craftTags = seller.categoryTypes?.length
        ? seller.categoryTypes
        : [...new Set(sellerProducts.map(p => p.category))];

      // Check if freshly onboarded (products listed within last 30 days)
      const isNew = productMeta?.oldestProduct &&
        (Date.now() - new Date(productMeta.oldestProduct).getTime()) < (30 * 24 * 60 * 60 * 1000);

      // Transform products to MAI format
      const maiProducts = sellerProducts.map(p => ({
        name: p.name,
        price: p.price,
        imgPath: p.images && p.images.length > 0 ? p.images[0] : null,
        category: p.category,
        quantity: p.quantity,
      }));

      return {
        id: seller.sellerId,
        name: businessName,
        founder: `${seller.founderFirstName || ''} ${seller.founderLastName || ''}`.trim() || businessName,
        state: state || null,
        craft: craftTags.length > 0 ? craftTags : ['Handmade'],
        brandUsp: seller.brandUsp || null,
        ecoTags: seller.ecoTags || [],
        products: maiProducts,
        isNew: isNew || false,
      };
    });

    // Only return sellers whose state was successfully resolved
    const validSellers = maiSellers.filter(s => s.state);

    return res.json({ sellers: validSellers });
  } catch (err) {
    console.error('MAI sellers fetch error:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve sellers for MAI.' });
  }
});

/**
 * GET /api/mai/sellers/:sellerId
 * Get a specific real seller by ID in MAI format
 * 
 * Response: { seller }
 */
router.get('/sellers/:sellerId', async (req, res) => {
  try {
    const seller = await Seller.findOne({ sellerId: req.params.sellerId }).lean();
    
    if (!seller) {
      return res.status(404).json({ error: 'Seller not found.' });
    }
    
    // Check if seller has products
    const products = await Product.find({ sellerId: seller.sellerId })
      .sort({ createdAt: -1 })
      .lean();
    
    if (products.length === 0) {
      return res.status(404).json({ error: 'Seller has no products listed.' });
    }
    
    // Transform to MAI format using explicit schema fields
    const businessName = seller.brandName || seller.companyName || 'Unnamed Business';
    const state = seller.state; // resolved + stored by pre-save hook
    const craftTags = seller.categoryTypes?.length
      ? seller.categoryTypes
      : [...new Set(products.map(p => p.category))];
    const isNew = products[0]?.createdAt &&
      (Date.now() - new Date(products[0].createdAt).getTime()) < (30 * 24 * 60 * 60 * 1000);

    const maiProducts = products.map(p => ({
      name: p.name,
      price: p.price,
      imgPath: p.images && p.images.length > 0 ? p.images[0] : null,
      category: p.category,
      quantity: p.quantity,
    }));

    const maiSeller = {
      id: seller.sellerId,
      name: businessName,
      founder: `${seller.founderFirstName || ''} ${seller.founderLastName || ''}`.trim() || businessName,
      state: state || null,
      craft: craftTags.length > 0 ? craftTags : ['Handmade'],
      brandUsp: seller.brandUsp || null,
      ecoTags: seller.ecoTags || [],
      products: maiProducts,
      isNew: isNew || false,
    };
    
    return res.json({ seller: maiSeller });
  } catch (err) {
    console.error('MAI seller fetch error:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve seller.' });
  }
});

module.exports = router;
