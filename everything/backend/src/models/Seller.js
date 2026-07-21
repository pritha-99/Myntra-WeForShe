const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema(
  {
    sellerId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // Mirrors every manifest field answer keyed by field id
    answers: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
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

module.exports = mongoose.model('Seller', sellerSchema);
