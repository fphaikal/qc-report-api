const mongoose = require("mongoose");

const NCRSchema = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
    name_part: { type: String, required: true },
    process: { type: String, required: true },
    operator: { type: String, required: true },
    target: { type: Number, required: true },
    start: { type: Number, required: true }, // Timestamp in milliseconds
    end: { type: Number, required: true },   // Timestamp in milliseconds
    total: { type: Number, required: true },
    ok: { type: Number, required: true },
    ng: { type: Number, required: true },
    type_ng: { type: String, required: true }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('NCR', NCRSchema);