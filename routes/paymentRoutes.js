import express from "express";
import { createCheckoutSession, saveOrderAfterPayment } from "../controllers/paymentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Protected: Only logged-in users can initiate payment
router.post("/create-checkout-session", verifyToken, createCheckoutSession);

// ✅ No auth required to save order after Stripe webhook (Stripe will call this)
router.post("/save-order", saveOrderAfterPayment);

export default router;
