const mongoose = require("mongoose");

const IPRSchema = new mongoose.Schema({
    info_date: { type: Date, required: true },
    department_section: { type: String, required: true },
    problem: { type: String, required: true },
    source: { type: String, required: true },
    item: { type: String, required: true },
    customer: { type: String, required: true },
    description: { type: String, required: true },
    cause: { type: String, required: true },
    countermeasure: { type: String, required: true },
    form_type: { type: String, required: true },
    pic: { type: String, required: true },
    start_date: { type: Date, required: true },
    progress: { type: Number, required: true }, // Assuming progress is a percentage
    target_due: { type: Date, required: true },
    actual_finish: { type: Date },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('IPR', IPRSchema);