/**
 * Script to update a product's back image in the database
 * 
 * Usage:
 * node update-product-image.js <productId> <imageFilename>
 * 
 * Example:
 * node update-product-image.js 67890abcdef onmodel-back-1784982929937.jpg
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');

async function updateProductImage(productId, imageFilename) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Ensure filename has correct format
    const imagePath = imageFilename.startsWith('/uploads/') 
      ? imageFilename 
      : `/uploads/${imageFilename}`;

    // Find the product
    const product = await Product.findById(productId);
    
    if (!product) {
      console.error(`❌ Product with ID ${productId} not found`);
      process.exit(1);
    }

    console.log(`📦 Found product: ${product.name}`);
    console.log(`📸 Current back image: ${product.garmentCatalog?.back?.onModel || 'none'}`);

    // Update the back image
    if (!product.garmentCatalog) {
      product.garmentCatalog = {};
    }
    if (!product.garmentCatalog.back) {
      product.garmentCatalog.back = {};
    }
    
    product.garmentCatalog.back.onModel = imagePath;
    
    // Also update the main images array (if back image is at index 1)
    if (product.images && product.images.length >= 2) {
      product.images[1] = imagePath;
    }

    // Save changes
    await product.save();
    
    console.log(`✅ Updated back image to: ${imagePath}`);
    console.log(`📸 New back image: ${product.garmentCatalog.back.onModel}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: node update-product-image.js <productId> <imageFilename>');
  console.log('Example: node update-product-image.js 67890abcdef onmodel-back-1784982929937.jpg');
  process.exit(1);
}

const [productId, imageFilename] = args;

updateProductImage(productId, imageFilename);
