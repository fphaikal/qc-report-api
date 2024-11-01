const mongoose = require("mongoose");

const FinalInspectionSchema = new mongoose.Schema({
    name_part: { type: String, required: true },
    process: { type: String, required: true },
    operator: { type: String, required: true },
    target: { type: Number, required: true },
    start: { type: String, required: true }, // Timestamp in milliseconds
    end: { type: String, required: true },   // Timestamp in milliseconds
    total: { type: Number, required: true },
    persen: { type: Number, required: true },
    ok: { type: Number, required: true },
    ng: { type: Number, required: true },
    type_ng: { type: String, required: true }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('FinalInspection', FinalInspectionSchema);
