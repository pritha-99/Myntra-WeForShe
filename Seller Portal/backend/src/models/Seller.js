const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { pincodeToState } = require('../utils/pincodeToState');

// ── Sub-schemas ─────────────────────────────────────────────────────────────

const warehouseSchema = new mongoose.Schema(
  {
    pincode:   { type: String, trim: true },   // 6-digit warehouse pincode
    address:   { type: String, trim: true },   // full warehouse address
    hours:     { type: String, trim: true },   // e.g. "09:00–18:00"
    contact:   { type: String, trim: true },   // pickup coordination phone
    capacity:  { type: Number, min: 0 },       // orders per day
  },
  { _id: false }
);

const bankSchema = new mongoose.Schema(
  {
    accountHolder: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    ifsc:          { type: String, trim: true },
    accountType:   { type: String, enum: ['savings', 'current'] },
    chequePhotoPath: { type: String, trim: true }, // uploaded file path
  },
  { _id: false }
);

// ── Main Seller schema ───────────────────────────────────────────────────────

const sellerSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────────────────
    sellerId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // ── Registration (Part 1) ─────────────────────────────────────────────
    phone:    { type: String, trim: true },
    email:    { type: String, trim: true, lowercase: true },
    gstin:    { type: String, trim: true, uppercase: true },
    password: { type: String },   // bcrypt-hashed password set during onboarding

    // From GST lookup (confirm_business_details)
    companyName: { type: String, trim: true },
    pan:         { type: String, trim: true, uppercase: true },
    gstState:    { type: String, trim: true }, // state as returned by GST lookup

    // Owner identity (confirm_name)
    founderFirstName: { type: String, trim: true },
    founderLastName:  { type: String, trim: true },

    signaturePath: { type: String, trim: true }, // uploaded file path

    // ── Basic Information (Part 2A) ───────────────────────────────────────
    primaryContactIsOwner:   { type: String, enum: ['me', 'other', 'none'] },
    businessOwnerIsRegistrant: { type: String, enum: ['yes', 'no'] },
    existingMyntraPartner:   { type: String, enum: ['yes', 'no'] },
    entityType:              { type: String, trim: true }, // from GST
    tdsOptional:             { type: String, enum: ['yes', 'no', 'explain'] },
    tanNumber:               { type: String, trim: true }, // if tdsOptional === 'yes'

    // ── Business Details (Part 2B) ────────────────────────────────────────
    omsChoice:             { type: String, enum: ['myntra', 'third_party', 'none'] },
    operationalReadiness:  { type: [String], default: [] }, // ['printer','labels','scanner','none']

    // ── Warehouse (Part 2C) ───────────────────────────────────────────────
    warehouse: { type: warehouseSchema, default: () => ({}) },

    // Derived + stored from warehouse.pincode via pre-save hook
    state: { type: String, trim: true, index: true },

    // ── Bank Details (Part 2D) ────────────────────────────────────────────
    bank: { type: bankSchema, default: () => ({}) },

    // ── Brand Details (Part 2E) ───────────────────────────────────────────
    brandName:         { type: String, trim: true },   // seller's display name on MAI
    natureOfBusiness:  { type: String, enum: ['make', 'sell', 'both', 'none'] },
    trademarkProofPath: { type: String, trim: true },  // uploaded file path
    avgMrp:            { type: Number, min: 0 },       // brand_mrp
    avgSellingPrice:   { type: Number, min: 0 },       // brand_selling_price
    brandUsp:          { type: String, trim: true },   // brand_usp (voice transcription)
    ecoTags:           { type: [String], default: [] }, // myntra_for_earth

    // ── Category & Sizing (Part 2F) ───────────────────────────────────────
    categoryTypes: { type: [String], default: [] }, // category_type multi-select

    // ── Online Presence (Part 2G) ─────────────────────────────────────────
    sellsElsewhere: { type: [String], default: [] }, // platforms

    // ── APOB (Part 2H) ────────────────────────────────────────────────────
    apobNeeded: { type: String, enum: ['yes', 'no'] },

    // ── Meta ──────────────────────────────────────────────────────────────
    language: {
      type: String,
      enum: ['en', 'ta', 'hi'],
      default: 'en',
    },
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'approved', 'rejected'],
      default: 'submitted',
    },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

// ── Pre-save hook: hash password + derive state from warehouse pincode ─────────
sellerSchema.pre('save', async function () {
  // Hash password if it was set / modified
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Derive state from warehouse pincode
  const pincode = this.warehouse?.pincode;
  if (pincode && !this.state) {
    const resolved = pincodeToState(pincode);
    if (resolved) this.state = resolved;
  }
});

// ── Instance method: verify password ────────────────────────────────────────
sellerSchema.methods.verifyPassword = async function (plainText) {
  if (!this.password) return false;

  // Detect if the stored value is a bcrypt hash (starts with $2b$ or $2a$)
  const isBcryptHash = this.password.startsWith('$2b$') || this.password.startsWith('$2a$');

  if (isBcryptHash) {
    return bcrypt.compare(plainText, this.password);
  }

  // Legacy / un-hashed password — compare directly then upgrade the hash in-place
  const isMatch = plainText === this.password;
  if (isMatch) {
    // Re-hash and save so future logins use bcrypt
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(plainText, salt);
    await this.save();
  }
  return isMatch;
};

module.exports = mongoose.model('Seller', sellerSchema);
