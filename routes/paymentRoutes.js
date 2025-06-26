// routes/paymentRoutes.js
import express from "express";
import { createCheckoutSession } from "../controllers/paymentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Stripe Checkout Session
router.post("/create-checkout-session", verifyToken, createCheckoutSession);

// ❌ REMOVE the webhook from here
export default router;
