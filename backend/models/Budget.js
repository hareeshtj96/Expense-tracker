const mongoose = require("mongoose");

const BudgetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    limit: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

BudgetSchema.index({ userId: 1, categoryId: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("Budget", BudgetSchema);
