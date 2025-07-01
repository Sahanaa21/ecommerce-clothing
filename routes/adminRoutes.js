import express from "express";
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
  uploadProduct, // ✅ Use only this for product upload via Admin UI
} from "../controllers/productController.js";

import {
  updateOrderStatus,
} from "../controllers/orderController.js";
import { getInvoiceByOrderId } from "../controllers/adminOrderController.js";


const router = express.Router();

/* ============================
   🔐 Admin Routes
============================ */

// 📊 Dashboard Stats
router.get("/dashboard", verifyToken, verifyAdmin, getAdminDashboard);
router.get("/stats", verifyToken, verifyAdmin, getAdminDashboard);
router.get("/orders/daily-revenue", verifyToken, verifyAdmin, getDailyRevenue);

// 👥 Users
router.get("/users", verifyToken, verifyAdmin, getAllUsers);

// 🛒 Orders
router.get("/orders", verifyToken, verifyAdmin, getAllOrders);
router.put("/orders/:id/status", verifyToken, verifyAdmin, updateOrderStatus);
router.get("/orders/:id/invoice", verifyToken, verifyAdmin, getInvoiceByOrderId);
// 🛍️ Admin Product Upload (from AdminUploadPage.js)
router.post("/products", verifyToken, verifyAdmin, uploadProduct); // ✅ Final route

export default router;
