import express from "express";
import { verifyAdmin, verifyToken } from "../middleware/authMiddleware.js";
import { getAllUsers } from "../controllers/adminController.js";
import { createProduct } from "../controllers/productController.js"; // ✅ Import this!

const router = express.Router();

// ✅ Admin Dashboard route
router.get("/dashboard", verifyToken, verifyAdmin, (req, res) => {
  res.json({ message: "Welcome to the Admin Dashboard" });
});

// ✅ Get all users (Admin-only)
router.get("/users", verifyToken, verifyAdmin, getAllUsers);

// ✅ Create a new product (Admin-only)
router.post("/products", verifyToken, verifyAdmin, createProduct);

// 🔜 Future: Add admin-specific routes here (order management, reports, etc.)

export default router;
