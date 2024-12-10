const mongoose = require('mongoose');

const partsSchema = new mongoose.Schema({
    part: String,
    customer: String,
})

module.exports = mongoose.model('Parts', partsSchema);