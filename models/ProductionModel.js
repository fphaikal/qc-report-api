const mongoose = require('mongoose');

const productionSchema = new mongoose.Schema({
  part_name: String,
  customer: String,
  prod: Number,
  ng_quantity: { type: Number, required: true },
  month: Number,
  year: Number
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Production', productionSchema);