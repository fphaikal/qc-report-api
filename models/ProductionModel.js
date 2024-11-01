const mongoose = require('mongoose');

const productionSchema = new mongoose.Schema({
  part_name: String,
  customer: String,
  prod: Number,
  ng: Number,
  month: Number,
  year: Number
}, { timestamps: true });

module.exports = mongoose.model('Production', productionSchema);