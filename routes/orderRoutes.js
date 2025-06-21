import express from "express";
import {verifyToken , verifyAdmin } from "../middleware/authMiddleware.js";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/checkout", verifyToken, createOrder);
router.get("/my-orders", verifyToken, getMyOrders); // ✅ This must be protected
router.get("/", verifyToken, verifyAdmin, getAllOrders);
router.put("/:id/status", verifyToken, verifyAdmin, updateOrderStatus);

export default router;
