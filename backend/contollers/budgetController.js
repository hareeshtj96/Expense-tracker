const Budget = require("../models/Budget");
const Category = require("../models/Category");

exports.listBudgetsForMonth = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const year = Number(req.query.year);
        const month = Number(req.query.month);
        if (!year || !month) return res.status(400).json({ message: "year and month required" });

        const budgets = await Budget.find({ userId, year, month }).lean();
        return res.json(budgets);
    } catch (err) { next(err); }
};


exports.createOrUpdateBudget = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const { categoryId, year, month, limit } = req.body;
        if (!categoryId || !year || !month) return res.status(400).json({ message: "Missing fields" });

        const query = { userId, categoryId, year: Number(year), month: Number(month) };

        if (limit === null || limit === undefined || limit === "" || Number(limit) <= 0) {
            // delete budget row
            const deleted = await Budget.findOneAndDelete(query).lean();

            await Category.findByIdAndUpdate(categoryId, { $set: { budget: 0 } });

            return res.json({ success: true, deleted });
        }

        const parsedLimit = Number(limit || 0);
        // create if not exists, else update
        const updated = await Budget.findOneAndUpdate(
            query,
            { $set: { limit: parsedLimit } },
            { upsert: true, new: true }
        ).lean();

        // update category.budget as well
        await Category.findByIdAndUpdate(categoryId, { $set: { budget: parsedLimit } })

        return res.json(updated);
    } catch (err) { next(err); }
};


exports.deleteBudget = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const id = req.params.id;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const deleted = await Budget.findOneAndDelete({ _id: id, userId }).lean();
        if (!deleted) return res.status(404).json({ message: "Not found" });
        return res.json({ success: true });
    } catch (err) { next(err); }
};
