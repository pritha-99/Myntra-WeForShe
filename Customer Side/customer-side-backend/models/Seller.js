const mongoose = require('mongoose');
const { pincodeToState } = require('../utils/pincodeToState');

const warehouseSchema = new mongoose.Schema(
  {
    pincode:  { type: String, trim: true },
    address:  { type: String, trim: true },
    hours:    { type: String, trim: true },
    contact:  { type: String, trim: true },
    capacity: { type: Number, min: 0 },
  },
  { _id: false }
);

const sellerSchema = new mongoose.Schema(
  {
    sellerId: { type: String, required: true, unique: true, index: true },

    // Founder identity
    founderFirstName: { type: String, trim: true },
    founderLastName:  { type: String, trim: true },
    companyName:      { type: String, trim: true },

    // Brand details
    brandName:       { type: String, trim: true },
    brandUsp:        { type: String, trim: true },
    avgMrp:          { type: Number, min: 0 },
    avgSellingPrice: { type: Number, min: 0 },
    ecoTags:         { type: [String], default: [] },
    categoryTypes:   { type: [String], default: [] },

    // Warehouse / location
    warehouse: { type: warehouseSchema, default: () => ({}) },
    state:     { type: String, trim: true, index: true },

    // Approval status
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'approved', 'rejected'],
      default: 'submitted',
    },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

// Derive state from warehouse pincode on save
sellerSchema.pre('save', function () {
  const pincode = this.warehouse?.pincode;
  if (pincode && !this.state) {
    const resolved = pincodeToState(pincode);
    if (resolved) this.state = resolved;
  }
});

module.exports = mongoose.model('Seller', sellerSchema);
