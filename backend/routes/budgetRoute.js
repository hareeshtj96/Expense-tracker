const express = require("express");
const router = express.Router();
const { listBudgetsForMonth, createOrUpdateBudget, deleteBudget } = require('../contollers/budgetController');
const { requireAuth } = require("../middlewares/authMiddleware");

router.use(requireAuth);

router.get("/", listBudgetsForMonth);
router.post("/", createOrUpdateBudget);
router.delete("/:id", deleteBudget);

module.exports = router;
