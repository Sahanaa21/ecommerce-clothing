import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import upload from "../middleware/multerMiddleware.js"; // ✅ Already handles multer setup
import verifyToken, { verifyAdmin } from "../middleware/authMiddleware.js";

import {
  createProduct,
  getAllProducts,
  uploadProduct,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

// 🛍️ Public - Get all products (with filters)
router.get("/", getAllProducts);

// 🔐 Admin - Create product via JSON (no image)
router.post("/", verifyToken, verifyAdmin, createProduct);

// 🔐 Admin - Upload product with image
router.post("/upload", verifyToken, verifyAdmin, upload.single("image"), uploadProduct);

// 🔐 Admin - Get single product by ID
router.get("/:id", verifyToken, verifyAdmin, getProductById);

// 🔐 Admin - Update product
router.put("/:id", verifyToken, verifyAdmin, upload.single("image"), updateProduct);

// 🔐 Admin - Delete product
router.delete("/:id", verifyToken, verifyAdmin, deleteProduct); // ✅ No need to use multer here

export default router;
