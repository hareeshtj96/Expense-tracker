const Category = require('../models/Category');

// Helper function to parse budget
function parseBudget(value) {
    if (value === undefined || value === null || value === "") return undefined;
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
}

exports.listCategories = async function (req, res, next) {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const categories = await Category.find({ userId }).sort({ createdAt: 1 }).lean();
        return res.json(categories);
    } catch (error) {
        next(error);
    }
};

exports.createCategory = async function (req, res, next) {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const { name, color, budget } = req.body;

        if (!name || typeof name !== "string") {
            return res.status(400).json({ message: "Category name is required" });
        }

        const budgetVal = parseBudget(budget) ?? 0;

        const cat = await Category.create({
            userId,
            name: name,
            color: color,
            budget: budgetVal
        });

        return res.status(201).json(cat);
    } catch (error) {
        next(error);
    }
};

exports.updateCategory = async function (req, res, next) {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const id = req.params.id;
        if (!id) return res.status(400).json({ message: "Category id is required" });

        const { name, color, budget } = req.body;

        // Build updates object only with provided fields
        const updates = {};
        if (name !== undefined) {
            if (typeof name !== "string" || name.trim() === "") {
                return res.status(400).json({ message: "Invalid name" });
            }
            updates.name = name.trim();
        }
        if (color !== undefined) {
            updates.color = color || "#60a5fa";
        }
        if (budget !== undefined) {
            const parsed = Number(budget);
            if (!Number.isFinite(parsed) || parsed < 0) {
                return res.status(400).json({ message: "Invalid budget value" });
            }
            updates.budget = parsed;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No valid fields to update" });
        }

        const updated = await Category.findOneAndUpdate(
            { _id: id, userId },
            { $set: updates },
            { new: true }
        ).lean();

        if (!updated) return res.status(404).json({ message: "Category not found" });

        return res.json(updated);
    } catch (error) {
        next(error);
    }
};

exports.deleteCategory = async function (req, res, next) {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const id = req.params.id;
        if (!id) return res.status(400).json({ message: "Category id is required" });

        const removed = await Category.findOneAndDelete({ _id: id, userId }).lean();
        if (!removed) return res.status(404).json({ message: "Category not found" });

        res.json({ success: true })
    } catch (error) {
        next(error)
    }
} 