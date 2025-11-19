const express = require("express");
const router = express.Router();
const { listCategories, createCategory, updateCategory, deleteCategory } = require("../contollers/categoryController");
const { requireAuth } = require("../middlewares/authMiddleware");

router.use(requireAuth);

router.get("/", listCategories);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

module.exports = router;