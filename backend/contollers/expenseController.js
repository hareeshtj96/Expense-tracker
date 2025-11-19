const Expense = require('../models/Expense');
const Category = require('../models/Category');

exports.listExpenses = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const year = Number(req.query.year);
        const month = Number(req.query.month);
        if (!year || !month) return res.status(400).json({ message: "year and month required" });

        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 1);

        const expenses = await Expense.find({
            userId,
            date: { $gte: start, $lt: end }
        }).sort({ date: -1 }).lean();

        res.json(expenses)
    } catch (error) {
        next(error)
    }
};

exports.createExpense = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const { categoryId, amount, date, description } = req.body;
        if (!categoryId || amount === undefined || !date) {
            return res.status(400).json({ message: "categoryId, amount and date are required" });
        }

        // verify category 
        const cat = await Category.findOne({ _id: categoryId, userId });
        if (!cat) return res.status(400).json({ message: "Invalid category" });

        const expense = await Expense.create({
            userId,
            categoryId,
            amount: Number(amount),
            date: new Date(date),
            description: description || ""
        });

        res.status(201).json({ success: true, expense });
    } catch (err) { next(err); }
};


exports.updateExpense = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const id = req.params.id;
        const updates = {};
        if (req.body.categoryId) updates.categoryId = req.body.categoryId;
        if (req.body.amount !== undefined) updates.amount = Number(req.body.amount);
        if (req.body.date) updates.date = new Date(req.body.date);
        if (req.body.description !== undefined) updates.description = req.body.description;

        const updated = await Expense.findOneAndUpdate({ _id: id, userId }, { $set: updates }, { new: true }).lean();
        if (!updated) return res.status(404).json({ message: "Not found" });

        res.json(updated);
    } catch (err) { next(err); }
};

exports.deleteExpense = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const id = req.params.id;
        const deleted = await Expense.findOneAndDelete({ _id: id, userId });
        if (!deleted) return res.status(404).json({ message: "Not found" });

        res.json({ success: true });
    } catch (err) { next(err); }
};