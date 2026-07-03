const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    contact: {
      type: String,
      trim: true,
      required: false, 
    },
    address: {
      type: String,
      trim: true,
      required: false, 
    },
    notes: {
      type: String,
      trim: true,
      required: false, 
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Vendor', vendorSchema);