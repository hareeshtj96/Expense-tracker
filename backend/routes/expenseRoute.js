const express = require("express");
const router = express.Router();
const { listExpenses, createExpense, updateExpense, deleteExpense } = require("../contollers/expenseController");
const { requireAuth } = require("../middlewares/authMiddleware");

router.use(requireAuth);

router.get("/", listExpenses);
router.post("/", createExpense);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

module.exports = router;