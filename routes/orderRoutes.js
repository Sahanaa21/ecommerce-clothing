import express from "express";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";
import {
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  downloadInvoice,
} from "../controllers/orderController.js";

const router = express.Router();

// ✅ Protected: User's own orders
router.get("/my-orders", verifyToken, getMyOrders);

// ✅ Admin-only: Get all orders
router.get("/", verifyToken, verifyAdmin, getAllOrders);

// ✅ Admin-only: Update order status (e.g. shipped/delivered)
router.put("/:id/status", verifyToken, verifyAdmin, updateOrderStatus);

// ✅ Protected: Download invoice for a specific order
router.get("/:id/invoice", verifyToken, downloadInvoice);

export default router;
