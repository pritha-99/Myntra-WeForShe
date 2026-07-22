const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    // Which seller listed this product
    sellerId: {
      type: String,
      required: true,
      index: true,
    },

    // Core product info (asked when seller lists a product after onboarding)
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    // Array of uploaded image file paths (relative to /uploads)
    images: {
      type: [String],
      default: [],
    },

    // Garment catalog data (automated on-model generation)
    garmentCatalog: {
      front: {
        original: String,
        onModel: String,
        generationStatus: String, // 'success' | 'failed' | 'skipped'
        reason: String,
        complianceReport: {
          fileSize: String,
          dimensions: String,
          format: String,
          aspectRatio: String,
          background: String,
          blur: String,
          watermark: String,
        }
      },
      back: {
        original: String,
        onModel: String,
        generationStatus: String,
        reason: String,
        complianceReport: {
          fileSize: String,
          dimensions: String,
          format: String,
          aspectRatio: String,
          background: String,
          blur: String,
          watermark: String,
        }
      },
      side: {
        onModel: String,
        generationStatus: String,
        reason: String,
        complianceReport: {
          fileSize: String,
          dimensions: String,
          format: String,
          aspectRatio: String,
          background: String,
          blur: String,
          watermark: String,
        }
      },
      additional: [{
        original: String,
        label: String,
        complianceReport: {
          fileSize: String,
          dimensions: String,
          format: String,
          aspectRatio: String,
          background: String,
          blur: String,
          watermark: String,
        }
      }],
      priceTagConfirmed: Boolean,
      generatedAt: Date
    },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

module.exports = mongoose.model('Product', productSchema);
