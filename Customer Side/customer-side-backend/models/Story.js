const mongoose = require('mongoose');

const storySchema = new mongoose.Schema(
  {
    sellerId:    { type: String, required: true, unique: true, index: true },
    gstin:       { type: String, trim: true },
    title:       { type: String, trim: true, default: 'My Craft Journey' },
    description: { type: String, required: true, trim: true },
    images:      { 
      type: [String], 
      default: [],
      validate: [val => val.length <= 5, 'Maximum 5 images allowed'] 
    },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

module.exports = mongoose.model('Story', storySchema);
