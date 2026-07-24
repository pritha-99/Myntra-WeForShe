/**
 * Test script for garment catalog service
 * Tests the validation and compliance checking functions
 */

const { validateCompliance } = require('./src/services/garmentCatalogService');
const path = require('path');

async function testCatalogService() {
  console.log('🧪 Testing Garment Catalog Service...\n');

  // Test with stock model images (these should exist)
  const testImages = [
    path.join(__dirname, 'src/assets/stock_models/front_stock.jpg'),
    path.join(__dirname, 'src/assets/stock_models/back_stock.jpg'),
    path.join(__dirname, 'src/assets/stock_models/side_stock.jpg'),
  ];

  for (const imagePath of testImages) {
    console.log(`Testing: ${path.basename(imagePath)}`);
    
    try {
      const report = await validateCompliance(imagePath);
      console.log('Compliance Report:', JSON.stringify(report, null, 2));
      console.log('');
    } catch (err) {
      console.error(`❌ Error testing ${path.basename(imagePath)}:`, err.message);
      console.log('');
    }
  }

  console.log('✅ Catalog service test complete!');
}

// Run the test
testCatalogService().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
