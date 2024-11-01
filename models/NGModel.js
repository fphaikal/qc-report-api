const mongoose = require("mongoose");

const NGSchema = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
    ncr_date: { type: Date, required: true },
    section: { type: String, required: true },
    product_name: { type: String, required: true },
    last_process: { type: String, required: true },
    customer: { type: String, required: true },
    value: { type: Number, required: true },
    ng_type: { type: String, required: true },
    ng_quantity: { type: Number, required: true },
    operator: { type: String, required: true },
    detection: { type: String, required: true },
    status: { type: Boolean, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },  // Month as a number (1-12)
    year: { type: Number, required: true }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('NG', NGSchema);