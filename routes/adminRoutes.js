import express from "express";
import multer from "multer";
import {
  verifyToken,
  verifyAdmin,
} from "../middleware/authMiddleware.js";

import {
  getAdminDashboard,
  getAllUsers,
  getDailyRevenue,
  getAllOrders,
} from "../controllers/adminController.js";

import {
  createProduct,
  uploadProduct,
} from "../controllers/productController.js";

import {
  updateOrderStatus,
} from "../controllers/orderController.js";

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

// 📊 Dashboard Stats + Graph Data
router.get("/dashboard", verifyToken, verifyAdmin, getAdminDashboard);
router.get("/stats", verifyToken, verifyAdmin, getAdminDashboard);
router.get("/orders/daily-revenue", verifyToken, verifyAdmin, getDailyRevenue);

// 👥 Users
router.get("/users", verifyToken, verifyAdmin, getAllUsers);

// 🛒 Orders
router.get("/orders", verifyToken, verifyAdmin, getAllOrders);
router.put("/orders/:id/status", verifyToken, verifyAdmin, updateOrderStatus);

// 🛍️ Products
router.post("/products", verifyToken, verifyAdmin, createProduct);
router.post(
  "/upload",
  verifyToken,
  verifyAdmin,
  upload.single("baseImage"),
  uploadProduct
);

export default router;
