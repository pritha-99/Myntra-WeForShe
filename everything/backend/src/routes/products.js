const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const { processGarmentCatalog } = require('../services/garmentCatalogService');

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
 * POST /api/products/generate-ai
 * Standalone endpoint to generate an on-model preview for a single garment image using FLUX Kontext Pro.
 * Accepts multipart/form-data with fields:
 *   - image (required)
 *   - pose ('front' | 'back', default 'front')
 */
router.post('/generate-ai', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Garment image is required for AI generation.' });
  }
  const pose = req.body.pose || 'front';
  const timestamp = Date.now();
  const uploadsDir = path.join(__dirname, '../../uploads');
  const outputPath = path.join(uploadsDir, `onmodel-${pose}-${timestamp}.jpg`);

  const { execFile } = require('child_process');
  const util = require('util');
  const execFileAsync = util.promisify(execFile);
  const scriptPath = path.join(__dirname, '../services/replicate_client.py');

  try {
    const args = [
      scriptPath,
      '--garment', req.file.path,
      '--output', outputPath,
      '--pose', pose,
    ];

    const { stdout } = await execFileAsync('python3', args, { timeout: 180000 });
    let resultJson;
    try {
      resultJson = JSON.parse(stdout.trim());
    } catch (e) {
      const match = stdout.match(/{"status":.*}/);
      resultJson = match ? JSON.parse(match[0]) : null;
    }

    if (resultJson && resultJson.status === 'success') {
      const imageUrl = `/uploads/${path.basename(outputPath)}`;
      return res.json({ imageUrl });
    } else {
      return res.status(500).json({ error: resultJson?.error || 'AI generation failed.' });
    }
  } catch (err) {
    console.error('Standalone AI generation error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate AI image.' });
  }
});

/**
 * POST /api/products
 * Create a new product listing for a seller.
 * Accepts multipart/form-data for image uploads.
 *
 * Fields: 
 *   - sellerId, name, price, category, quantity (required)
 *   - frontImage (required) - front flat-lay garment photo
 *   - backImage (required) - back flat-lay garment photo
 *   - additionalImages[] (optional, max 5) - fabric/detail photos
 *   - priceTagConfirmed (boolean)
 * Response: { product }
 */
router.post('/', upload.fields([
  { name: 'frontImage', maxCount: 1 },
  { name: 'backImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 5 },
  { name: 'images', maxCount: 10 } // Backward compatibility
]), async (req, res) => {
  const { sellerId, name, price, category, quantity, priceTagConfirmed, frontImageMode, backImageMode } = req.body;

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

  try {
    let garmentCatalog = null;
    let images = [];

    // Check if this is a garment catalog upload (frontImage + backImage)
    const frontImage = req.files?.frontImage?.[0];
    const backImage = req.files?.backImage?.[0];
    const additionalImages = req.files?.additionalImages || [];

    if (frontImage && backImage) {
      // NEW FLOW: Automated garment catalog generation
      try {
        const uploadsDir = path.join(__dirname, '../../uploads');
        const imageModes = {
          front: frontImageMode || 'upload',
          back: backImageMode || 'upload',
        };
        garmentCatalog = await processGarmentCatalog(
          frontImage,
          backImage,
          additionalImages,
          priceTagConfirmed === 'true',
          uploadsDir,
          imageModes
        );
        
        // Collect all successfully generated images for the main images array
        if (garmentCatalog.front.onModel) images.push(garmentCatalog.front.onModel);
        if (garmentCatalog.back.onModel) images.push(garmentCatalog.back.onModel);
        if (garmentCatalog.side.onModel) images.push(garmentCatalog.side.onModel);
        
        // Add original images as fallback
        if (!garmentCatalog.front.onModel) images.push(garmentCatalog.front.original);
        if (!garmentCatalog.back.onModel) images.push(garmentCatalog.back.original);
        
        // Add additional images
        garmentCatalog.additional.forEach(item => images.push(item.original));
        
      } catch (catalogError) {
        console.error('Garment catalog processing failed:', catalogError.message);
        return res.status(400).json({ error: catalogError.message });
      }
    } else {
      // OLD FLOW: Simple image upload (backward compatibility)
      const regularImages = req.files?.images || [];
      images = regularImages.map((f) => `/uploads/${f.filename}`);
    }

    const product = new Product({
      sellerId,
      name: name.trim(),
      price: parsedPrice,
      category: category.trim(),
      quantity: parsedQty,
      images,
      garmentCatalog
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
