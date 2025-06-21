import express from "express";
import { verifyAdmin, verifyToken } from "../middleware/authMiddleware.js";
import { getAllUsers } from "../controllers/adminController.js";

const router = express.Router();

// ✅ Admin Dashboard placeholder
router.get("/dashboard", verifyToken, verifyAdmin, (req, res) => {
  res.json({ message: "Welcome to the Admin Dashboard" });
});

// ✅ Get all users (Admin-only)
router.get("/users", verifyToken, verifyAdmin, getAllUsers);

// 🔜 Future: Add admin-specific routes here (orders, reports, etc.)

export default router;
