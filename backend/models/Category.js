const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    color: { type: String, default: "#60a5fa" },
    budget: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

CategorySchema.index({ userId: 1, name: 1 }, { unique: false });

module.exports = mongoose.model("Category", CategorySchema);