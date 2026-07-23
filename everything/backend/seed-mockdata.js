/**
 * seed-mockdata.js
 * Pushes all SELLERS from mockdata.js into MongoDB as Seller + Product documents.
 * Run from the backend directory: node seed-mockdata.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// ── Inline the Seller + Product models (avoids circular dependency issues) ──

const { pincodeToState } = require('./src/utils/pincodeToState');

const warehouseSchema = new mongoose.Schema({ pincode: String, address: String, hours: String, contact: String, capacity: Number }, { _id: false });
const bankSchema = new mongoose.Schema({ accountHolder: String, accountNumber: String, ifsc: String, accountType: String, chequePhotoPath: String }, { _id: false });

const sellerSchema = new mongoose.Schema({
  sellerId: { type: String, required: true, unique: true, index: true },
  phone: String, email: String, gstin: String,
  companyName: String, pan: String, gstState: String,
  founderFirstName: String, founderLastName: String, signaturePath: String,
  primaryContactIsOwner: String, businessOwnerIsRegistrant: String,
  existingMyntraPartner: String, entityType: String,
  tdsOptional: String, tanNumber: String,
  omsChoice: String, operationalReadiness: [String],
  warehouse: { type: warehouseSchema, default: () => ({}) },
  state: { type: String, index: true },
  bank: { type: bankSchema, default: () => ({}) },
  brandName: String, natureOfBusiness: String, trademarkProofPath: String,
  avgMrp: Number, avgSellingPrice: Number, brandUsp: String, ecoTags: [String],
  categoryTypes: [String],
  sellsElsewhere: [String],
  apobNeeded: String,
  language: { type: String, default: 'en' },
  status: { type: String, default: 'approved' }, // mock sellers are pre-approved
}, { timestamps: true });

sellerSchema.pre('save', function () {
  const pincode = this.warehouse?.pincode;
  if (pincode && !this.state) {
    const resolved = pincodeToState(pincode);
    if (resolved) this.state = resolved;
  }
});

const SellerModel = mongoose.model('Seller', sellerSchema);

const productSchema = new mongoose.Schema({
  sellerId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, default: 10 },
  images: { type: [String], default: [] },
}, { timestamps: true });

const ProductModel = mongoose.model('Product', productSchema);

// ── Mock data (from mockdata.js) ─────────────────────────────────────────────

// Paths to stock model images served from /uploads (copies will be created if absent)
// Using the 3 stock model images stored in everything/backend/src/assets/stock_models/
const STOCK_IMG = {
  front: '/uploads/stock-front.jpg',
  back:  '/uploads/stock-back.jpg',
  side:  '/uploads/stock-side.jpg',
};

// Helper: round-robin through stock images to give each product an image
let _stockIdx = 0;
function nextStockImg() {
  const imgs = [STOCK_IMG.front, STOCK_IMG.back, STOCK_IMG.side];
  return imgs[(_stockIdx++) % imgs.length];
}


const SELLERS = [
  { id: 's1', name: 'Meenakshi Silks', founder: 'Meenakshi Ramaswamy', city: 'Kanchipuram', state: 'Tamil Nadu', craft: ['Textiles', 'GI-Tagged', 'Meet the Maker'], brandUsp: 'Four generations of Kanchipuram silk weaving. Every saree takes 10–20 days to hand-weave.', avgMrp: 12000, avgSellingPrice: 8500, products: [{ name: 'Pure Silk Kanchipuram Saree – Amethyst', price: 8500, category: 'Sarees', quantity: 5 }, { name: 'Half-Silk Kanchipuram Saree – Pearl', price: 4200, category: 'Sarees', quantity: 8 }, { name: 'Silk Blouse Fabric – Azure Gold', price: 1200, category: 'Sarees', quantity: 20 }, { name: 'Kanchipuram Silk Dupatta', price: 2800, category: 'Sarees', quantity: 12 }] },
  { id: 's2', name: 'Ranjit Block Printing', founder: 'Ranjit Singh Choudhary', city: 'Jaipur', state: 'Rajasthan', craft: ['Textiles', 'Meet the Maker', 'GI-Tagged'], brandUsp: 'Third-generation block printer from old Jaipur. Ranjit hand-carves his own teak blocks.', avgMrp: 2200, avgSellingPrice: 1450, products: [{ name: 'Indigo Block-Print Kurta', price: 1450, category: 'Kurtas & Suits', quantity: 15 }, { name: 'Bagru Print Table Runner Set', price: 880, category: 'Home & Living', quantity: 20 }, { name: 'Sanganeri Print Kurti – Marigold', price: 1100, category: 'Kurtas & Suits', quantity: 18 }, { name: 'Block Print Bedsheet Set', price: 2200, category: 'Home & Living', quantity: 10 }] },
  { id: 's3', name: 'Kashmir Pashmina House', founder: 'Abdul Rashid Khan', city: 'Srinagar', state: 'Jammu & Kashmir', craft: ['Textiles', 'GI-Tagged', 'Dying Art'], brandUsp: 'Authentic Pashmina from Changra goats of Ladakh. Each shawl takes 3–6 months.', avgMrp: 18000, avgSellingPrice: 12000, products: [{ name: 'Pure Pashmina Shawl – Kashmir Red', price: 12000, category: 'Ethnic Wear', quantity: 4 }, { name: 'Shahtoosh-Mix Wrap – Ivory', price: 6800, category: 'Ethnic Wear', quantity: 6 }, { name: 'Kani-Woven Stole – Multicolor', price: 9500, category: 'Ethnic Wear', quantity: 3 }] },
  { id: 's4', name: 'Bhuj Bandhani Co.', founder: 'Fatima Khatri', city: 'Bhuj', state: 'Gujarat', craft: ['Textiles', 'GI-Tagged', 'Meet the Maker'], brandUsp: 'Khatri community Bandhani for 500 years. Fatima leads 18 women artisans.', avgMrp: 5000, avgSellingPrice: 3400, products: [{ name: 'Bandhani Silk Dupatta – Flamingo Pink', price: 2200, category: 'Ethnic Wear', quantity: 15 }, { name: 'Bandhani Cotton Saree – Sunrise', price: 3400, category: 'Sarees', quantity: 10 }, { name: 'Gharchola Bridal Dupatta', price: 5800, category: 'Ethnic Wear', quantity: 5 }] },
  { id: 's5', name: 'Mithila Kala Studio', founder: 'Savita Devi', city: 'Madhubani', state: 'Bihar', craft: ['Textiles', 'GI-Tagged', 'Dying Art', 'Meet the Maker'], brandUsp: 'National Award-winning Madhubani artist. Ancient Mithila painting on fabric.', avgMrp: 5600, avgSellingPrice: 3800, products: [{ name: 'Madhubani Hand-Painted Silk Stole', price: 3800, category: 'Ethnic Wear', quantity: 8 }, { name: 'Madhubani Cotton Kurti – Fish Motif', price: 2100, category: 'Kurtas & Suits', quantity: 12 }, { name: 'Madhubani Art Wall Panel (Textile)', price: 4500, category: 'Home & Living', quantity: 6 }] },
  { id: 's6', name: 'Sundarbans Kantha Weave', founder: 'Purnima Mondal', city: 'Bolpur', state: 'West Bengal', craft: ['Textiles', 'Meet the Maker', 'Freshly Onboarded'], brandUsp: 'Kantha cooperative of 30 rural women in Bolpur. New life from old sarees.', avgMrp: 4800, avgSellingPrice: 3200, products: [{ name: 'Kantha Double-Sided Quilt – Bengal Crimson', price: 3200, category: 'Home & Living', quantity: 10 }, { name: 'Kantha Embroidered Shoulder Bag', price: 1400, category: 'Jewellery & Accessories', quantity: 20 }, { name: 'Kantha Silk Running Stole', price: 1800, category: 'Ethnic Wear', quantity: 15 }] },
  { id: 's7', name: 'Assam Eri Silk Weavers', founder: 'Dipanjali Borah', city: 'Sualkuchi', state: 'Assam', craft: ['Textiles', 'GI-Tagged', 'Dying Art'], brandUsp: 'Sualkuchi — Manchester of Assam. Eri and Muga silk on hundred-year-old looms.', avgMrp: 11000, avgSellingPrice: 7500, products: [{ name: 'Muga Silk Mekhela Sador', price: 7500, category: 'Ethnic Wear', quantity: 6 }, { name: 'Eri Silk Shawl – Natural', price: 4200, category: 'Ethnic Wear', quantity: 8 }] },
  { id: 's8', name: 'Andhra Kalamkari Arts', founder: 'Venkata Rama Rao', city: 'Srikalahasti', state: 'Andhra Pradesh', craft: ['Textiles', 'GI-Tagged', 'Meet the Maker'], brandUsp: '3000-year-old Kalamkari art. Hand-drawn mythological narratives on cotton.', avgMrp: 7800, avgSellingPrice: 5200, products: [{ name: 'Kalamkari Cotton Saree – Ramayana Series', price: 5200, category: 'Sarees', quantity: 5 }, { name: 'Kalamkari Silk Dupatta', price: 2800, category: 'Ethnic Wear', quantity: 10 }] },
  { id: 's9', name: 'Rajasthan Pottery Guild', founder: 'Mohan Kumawat', city: 'Jaipur', state: 'Rajasthan', craft: ['Pottery', 'GI-Tagged', 'Dying Art'], brandUsp: 'Jaipur Blue Pottery — uses no clay. Quartz-based Mughal-era technique.', avgMrp: 2600, avgSellingPrice: 1800, products: [{ name: 'Blue Pottery Chai Set – Floral', price: 1800, category: 'Home & Living', quantity: 12 }, { name: 'Blue Pottery Vase – Peacock', price: 1200, category: 'Home & Living', quantity: 18 }] },
  { id: 's10', name: 'Kashmir Copper Craft', founder: 'Bashir Ahmad', city: 'Srinagar', state: 'Jammu & Kashmir', craft: ['Woodwork', 'Freshly Onboarded'], brandUsp: '700-year-old Naqqashi hand-engraving tradition. No two pieces the same.', avgMrp: 4800, avgSellingPrice: 3200, products: [{ name: 'Walnut Wood Jewellery Box – Engraved', price: 3200, category: 'Home & Living', quantity: 8 }, { name: 'Copper Serving Tray – Chinar Leaf', price: 2400, category: 'Home & Living', quantity: 10 }] },
  { id: 's11', name: 'Kutch Embroidery Collective', founder: 'Hajra Sumra', city: 'Anjar', state: 'Gujarat', craft: ['Textiles', 'Meet the Maker', 'Freshly Onboarded'], brandUsp: 'Kutch embroidery — Suf, Rabari, and Ahir styles, each distinct in stitch.', avgMrp: 2400, avgSellingPrice: 1600, products: [{ name: 'Kutch Embroidered Tote – Rabari', price: 1600, category: 'Jewellery & Accessories', quantity: 15 }, { name: 'Kutch Cushion Cover Set – Ahir', price: 1200, category: 'Home & Living', quantity: 20 }] },
  { id: 's12', name: 'Odisha Sambalpuri Handloom', founder: 'Padmavathi Meher', city: 'Sambalpur', state: 'Odisha', craft: ['Textiles', 'GI-Tagged'], brandUsp: 'Sambalpuri ikat — yarn dyed before weaving. GI-tagged handwoven on pit looms.', avgMrp: 13000, avgSellingPrice: 8500, products: [{ name: 'Sambalpuri Ikat Cotton Saree', price: 4200, category: 'Sarees', quantity: 8 }, { name: 'Sambalpuri Silk Saree – Premium', price: 8500, category: 'Sarees', quantity: 4 }] },
];

// State → pincode mapping (one representative pincode per seller's state/city)
const CITY_PINCODE = {
  'Kanchipuram':   '631501',
  'Jaipur':        '302001',
  'Srinagar':      '190001',
  'Bhuj':          '370001',
  'Madhubani':     '847211',
  'Bolpur':        '731204',
  'Sualkuchi':     '781103',
  'Srikalahasti':  '517644',
  'Anjar':         '370110',
  'Sambalpur':     '768001',
};

// ── Seed function ─────────────────────────────────────────────────────────────

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected.\n');

  let sellerInserted = 0, sellerSkipped = 0, productInserted = 0;

  for (const s of SELLERS) {
    // Check if seller already exists
    const existing = await SellerModel.findOne({ sellerId: s.id });
    if (existing) {
      console.log(`⏭  Skipping ${s.name} (${s.id}) — already in DB`);
      sellerSkipped++;
    } else {
      const founderParts = s.founder.split(' ');
      const founderFirstName = founderParts[0];
      const founderLastName = founderParts.slice(1).join(' ');
      const pincode = CITY_PINCODE[s.city] || null;

      const seller = new SellerModel({
        sellerId: s.id,
        brandName: s.name,
        founderFirstName,
        founderLastName,
        brandUsp: s.brandUsp,
        avgMrp: s.avgMrp,
        avgSellingPrice: s.avgSellingPrice,
        categoryTypes: s.craft,
        ecoTags: [],
        warehouse: { pincode, address: s.city },
        state: s.state, // set directly since these are mock sellers
        language: 'en',
        status: 'approved',
      });

      await seller.save();
      console.log(`✅  Inserted seller: ${s.name} (${s.id}) — state: ${s.state}`);
      sellerInserted++;
    }

    // Insert products for this seller
    for (const p of s.products) {
      const stockImg = nextStockImg();
      const existingProduct = await ProductModel.findOne({ sellerId: s.id, name: p.name });
      if (!existingProduct) {
        await ProductModel.create({
          sellerId: s.id,
          name: p.name,
          price: p.price,
          category: p.category,
          quantity: p.quantity,
          images: [stockImg],  // Assign a stock model image for display
        });
        console.log(`   📦 Product: ${p.name} (₹${p.price}) — image: ${stockImg}`);
        productInserted++;
      } else if (!existingProduct.images || existingProduct.images.length === 0) {
        // Backfill existing products that have no images
        await ProductModel.updateOne({ _id: existingProduct._id }, { $set: { images: [stockImg] } });
        console.log(`   🔄 Backfilled image for: ${p.name}`);
      }
    }
  }

  console.log(`\n─────────────────────────────────────────`);
  console.log(`✅  Done! Sellers inserted: ${sellerInserted}, skipped: ${sellerSkipped}`);
  console.log(`📦  Products inserted: ${productInserted}`);
  console.log(`─────────────────────────────────────────`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
