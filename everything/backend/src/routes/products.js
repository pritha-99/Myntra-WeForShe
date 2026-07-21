const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');

// ── Multer storage config ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per image
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase())
                && allowed.test(file.mimetype);
    if (ok) cb(null, true);
    else cb(new Error('Only image files are allowed.'));
  },
});

/**
 * POST /api/products
 * Create a new product listing for a seller.
 * Accepts multipart/form-data for image uploads.
 *
 * Fields: sellerId, name, price, category, quantity, images[]
 * Response: { product }
 */
router.post('/', upload.array('images', 10), async (req, res) => {
  const { sellerId, name, price, category, quantity } = req.body;

  if (!sellerId || !name || price === undefined || !category || quantity === undefined) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const parsedPrice = parseFloat(price);
  const parsedQty = parseInt(quantity, 10);

  if (isNaN(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ error: 'Price must be a non-negative number.' });
  }
  if (isNaN(parsedQty) || parsedQty < 0) {
    return res.status(400).json({ error: 'Quantity must be a non-negative integer.' });
  }

  // Build image paths relative to /uploads (served as /uploads/<filename>)
  const images = (req.files || []).map((f) => `/uploads/${f.filename}`);

  try {
    const product = new Product({
      sellerId,
      name: name.trim(),
      price: parsedPrice,
      category: category.trim(),
      quantity: parsedQty,
      images,
    });
    await product.save();
    return res.status(201).json({ product });
  } catch (err) {
    console.error('Product create error:', err.message);
    return res.status(500).json({ error: 'Failed to save product.' });
  }
});

/**
 * GET /api/products/:sellerId
 * List all products for a given seller (sorted newest first).
 *
 * Response: { products: [] }
 */
router.get('/:sellerId', async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.params.sellerId })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ products });
  } catch (err) {
    console.error('Product list error:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve products.' });
  }
});

module.exports = router;
