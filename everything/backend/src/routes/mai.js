const express = require('express');
const router = express.Router();
const Seller = require('../models/Seller');
const Product = require('../models/Product');
const { pincodeToState } = require('../utils/pincodeToState');

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
      
      // Extract data from seller.answers
      const businessName = seller.answers?.businessName || 'Unnamed Business';
      const pincode = seller.answers?.pincode;
      
      // Resolve state from pincode
      const state = pincodeToState(pincode);
      
      // Derive city - try to extract from existing lookup if available
      // For now, use a placeholder; in production this would use a full pincode API
      let city = 'City';
      if (pincode && state) {
        // Simple city mapping based on common pincodes
        const cityMap = {
          '560': 'Bengaluru',
          '400': 'Mumbai',
          '110': 'New Delhi',
          '600': 'Chennai',
          '500': 'Hyderabad',
          '302': 'Jaipur',
          '700': 'Kolkata',
          '380': 'Ahmedabad',
          '411': 'Pune',
          '226': 'Lucknow',
          '800': 'Patna',
          '190': 'Srinagar',
          '682': 'Kochi',
          '641': 'Coimbatore',
          '751': 'Bhubaneswar',
          '781': 'Guwahati',
          '462': 'Bhopal',
          '492': 'Raipur',
          '360': 'Rajkot',
          '570': 'Mysuru',
        };
        const prefix = String(pincode).substring(0, 3);
        city = cityMap[prefix] || state;
      }
      
      // Derive craft tags from product categories (deduplicated)
      const craftTags = [...new Set(sellerProducts.map(p => p.category))];
      
      // Check if "freshly onboarded" (products created within last 30 days)
      const isNew = productMeta?.oldestProduct &&
        (Date.now() - new Date(productMeta.oldestProduct).getTime()) < (30 * 24 * 60 * 60 * 1000);
      
      // Transform products to MAI format
      const maiProducts = sellerProducts.map(p => ({
        name: p.name,
        price: p.price,
        mrp: Math.round(p.price * 1.4), // Estimate MRP as 40% above price
        imgPath: p.images && p.images.length > 0 ? p.images[0] : null,
        craft: `${p.category}. ${p.quantity} available.`,
        emoji: '🛍', // Default emoji
        gi: false // Real sellers don't have GI verification in this iteration
      }));
      
      return {
        id: seller.sellerId,
        name: businessName,
        founder: businessName, // Using business name as founder fallback
        city: city,
        state: state || 'India',
        craft: craftTags.length > 0 ? craftTags : ['Handmade'],
        description: `${businessName} — Authentic handcrafted products from ${state || 'India'}.`,
        story: [], // No story in this iteration - mock stories retained
        products: maiProducts,
        verified: false, // No verification workflow yet
        hasStory: false, // No story feature in this iteration
        isNew: isNew || false
      };
    });

    // Filter out sellers where state couldn't be resolved
    const validSellers = maiSellers.filter(s => s.state && s.state !== 'India');
    
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
    
    // Transform to MAI format (same logic as above)
    const businessName = seller.answers?.businessName || 'Unnamed Business';
    const pincode = seller.answers?.pincode;
    const state = pincodeToState(pincode);
    
    let city = 'City';
    if (pincode && state) {
      const cityMap = {
        '560': 'Bengaluru', '400': 'Mumbai', '110': 'New Delhi',
        '600': 'Chennai', '500': 'Hyderabad', '302': 'Jaipur',
        '700': 'Kolkata', '380': 'Ahmedabad', '411': 'Pune'
      };
      const prefix = String(pincode).substring(0, 3);
      city = cityMap[prefix] || state;
    }
    
    const craftTags = [...new Set(products.map(p => p.category))];
    const isNew = products[0]?.createdAt &&
      (Date.now() - new Date(products[0].createdAt).getTime()) < (30 * 24 * 60 * 60 * 1000);
    
    const maiProducts = products.map(p => ({
      name: p.name,
      price: p.price,
      mrp: Math.round(p.price * 1.4),
      imgPath: p.images && p.images.length > 0 ? p.images[0] : null,
      craft: `${p.category}. ${p.quantity} available.`,
      emoji: '🛍',
      gi: false
    }));
    
    const maiSeller = {
      id: seller.sellerId,
      name: businessName,
      founder: businessName,
      city: city,
      state: state || 'India',
      craft: craftTags.length > 0 ? craftTags : ['Handmade'],
      description: `${businessName} — Authentic handcrafted products from ${state || 'India'}.`,
      story: [],
      products: maiProducts,
      verified: false,
      hasStory: false,
      isNew: isNew || false
    };
    
    return res.json({ seller: maiSeller });
  } catch (err) {
    console.error('MAI seller fetch error:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve seller.' });
  }
});

module.exports = router;
