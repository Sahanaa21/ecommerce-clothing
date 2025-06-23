// routes/paymentRoutes.js
import express from "express";
import {
  createCheckoutSession,
  saveOrderAfterPayment
} from "../controllers/paymentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Initiate Stripe Checkout (requires login)
router.post("/create-checkout-session", verifyToken, createCheckoutSession);

// ✅ Stripe Webhook to Save Order (no auth required)
router.post("/save-order", saveOrderAfterPayment);


export default router;
