/**
 * Interactive script to update product images
 * 
 * Usage:
 * node interactive-update-image.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // List all products
    const products = await Product.find().sort({ createdAt: -1 }).limit(20);
    
    if (products.length === 0) {
      console.log('❌ No products found in database');
      process.exit(0);
    }

    console.log('📦 Available Products:\n');
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (ID: ${product._id})`);
      console.log(`   Seller: ${product.sellerId}`);
      console.log(`   Front: ${product.garmentCatalog?.front?.onModel || product.images?.[0] || 'none'}`);
      console.log(`   Back:  ${product.garmentCatalog?.back?.onModel || product.images?.[1] || 'none'}`);
      console.log('');
    });

    // Get product selection
    const productNum = await question('Enter product number to update (or "q" to quit): ');
    
    if (productNum.toLowerCase() === 'q') {
      console.log('👋 Goodbye!');
      process.exit(0);
    }

    const selectedIndex = parseInt(productNum) - 1;
    
    if (selectedIndex < 0 || selectedIndex >= products.length) {
      console.log('❌ Invalid product number');
      process.exit(1);
    }

    const product = products[selectedIndex];
    console.log(`\n📦 Selected: ${product.name}\n`);

    // Get which image to update
    const imageType = await question('Which image to update? (front/back): ');
    
    if (!['front', 'back'].includes(imageType.toLowerCase())) {
      console.log('❌ Invalid image type. Must be "front" or "back"');
      process.exit(1);
    }

    // Get new image filename
    const imageFilename = await question('Enter new image filename (e.g., onmodel-back-1784982929937.jpg): ');
    
    const imagePath = imageFilename.startsWith('/uploads/') 
      ? imageFilename 
      : `/uploads/${imageFilename}`;

    // Confirm
    console.log(`\n📸 Will update ${imageType} image to: ${imagePath}`);
    const confirm = await question('Proceed? (yes/no): ');
    
    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      console.log('❌ Cancelled');
      process.exit(0);
    }

    // Update the product
    if (!product.garmentCatalog) {
      product.garmentCatalog = {};
    }
    if (!product.garmentCatalog[imageType]) {
      product.garmentCatalog[imageType] = {};
    }
    
    product.garmentCatalog[imageType].onModel = imagePath;
    
    // Also update main images array
    const imageIndex = imageType === 'front' ? 0 : 1;
    if (product.images && product.images.length > imageIndex) {
      product.images[imageIndex] = imagePath;
    } else {
      if (!product.images) product.images = [];
      product.images[imageIndex] = imagePath;
    }

    // Save
    await product.save();
    
    console.log(`\n✅ Successfully updated ${imageType} image!`);
    console.log(`📸 New ${imageType} image: ${product.garmentCatalog[imageType].onModel}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

main();
