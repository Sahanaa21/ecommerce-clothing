// routes/adminRoutes.js
import express from "express";
import multer from "multer";
import { verifyAdmin, verifyToken } from "../middleware/authMiddleware.js";
import { getAllUsers } from "../controllers/adminController.js";
import { createProduct, uploadProduct } from "../controllers/productController.js";

const router = express.Router();

// ✅ Multer setup
const upload = multer({ dest: "uploads/" });

// ✅ Admin dashboard
router.get("/dashboard", verifyToken, verifyAdmin, (req, res) => {
  res.json({ message: "Welcome to the Admin Dashboard" });
});

// ✅ Admin: Get all users
router.get("/users", verifyToken, verifyAdmin, getAllUsers);

// ✅ Admin: Create product with raw JSON
router.post("/products", verifyToken, verifyAdmin, createProduct);

// ✅ Admin: Upload product with image via multipart/form-data
router.post(
  "/upload",
  verifyToken,
  verifyAdmin,
  upload.single("baseImage"),
  uploadProduct
);

export default router;
