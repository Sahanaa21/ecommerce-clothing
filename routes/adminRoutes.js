import express from "express";
import multer from "multer";
import { verifyAdmin, verifyToken } from "../middleware/authMiddleware.js";
import { getAllUsers } from "../controllers/adminController.js";
import {
  createProduct,
  uploadProduct,
} from "../controllers/productController.js";

const router = express.Router();

/* ===========================
   📸 Multer Config (Admin Uploads)
=========================== */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

/* ===========================
   🔐 Admin Routes
=========================== */

// 📊 Admin Dashboard
router.get("/dashboard", verifyToken, verifyAdmin, (req, res) => {
  res.json({ message: "Welcome to the Admin Dashboard" });
});

// 👥 Get all users
router.get("/users", verifyToken, verifyAdmin, getAllUsers);

// 🛍️ Create product with raw JSON (e.g. via Postman)
router.post("/products", verifyToken, verifyAdmin, createProduct);

// 🖼️ Upload product with image (from AdminUploadPage form)
router.post(
  "/upload",
  verifyToken,
  verifyAdmin,
  upload.single("baseImage"),
  uploadProduct
);

export default router;
