// routes/paymentRoutes.js
import express from "express";
import {
  createCheckoutSession,
  handleStripeWebhook,
} from "../controllers/paymentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Step 1: Create Checkout Session (requires login)
router.post("/create-checkout-session", verifyToken, createCheckoutSession);

// ✅ Step 2: Stripe Webhook to capture completed payments
// ⚠️ Must be mounted BEFORE express.json in server.js
router.post(
  "/webhook/save-order",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

export default router;
