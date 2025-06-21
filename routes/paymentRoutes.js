import express from "express";
import { createCheckoutSession } from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { saveOrderAfterPayment } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-checkout-session", protect, createCheckoutSession);
router.post("/save-order", saveOrderAfterPayment);
export default router;
