// controllers/paymentController.js
import Stripe from "stripe";
import dotenv from "dotenv";
import Order from "../models/Order.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Create Stripe Checkout Session
export const createCheckoutSession = async (req, res) => {
  try {
    const { items, address, designImage } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    const lineItems = items.map((item) => {
  if (!item.price || isNaN(item.price)) {
    throw new Error(`❌ Invalid price for item: ${item.name}`);
  }

  return {
    price_data: {
      currency: "inr",
      product_data: {
        name: item.name,
      },
      unit_amount: Math.round(item.price * 100), // convert ₹ to paise
    },
    quantity: item.quantity,
  };
});




    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "http://localhost:3000/success", // ✅ replace with live URL on deploy
      cancel_url: "http://localhost:3000/cancel",
      metadata: {
        userId: req.user._id.toString(),
        address,
        designImage: designImage || "",
        items: JSON.stringify(items),
      },
    });

    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error("Stripe Session Error:", error.message);
    res.status(500).json({ message: "Failed to create checkout session" });
  }
};

// ✅ Save Order after Stripe Payment (webhook)
export const saveOrderAfterPayment = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  console.log("🔔 Incoming Stripe Webhook...");
  console.log("📦 Raw body received:", req.body); // should be a Buffer
  console.log("📬 Signature:", sig);

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Stripe Signature Verification Failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ You’ll reach here only if signature passes
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("✅ Session Metadata:", session.metadata);
    return res.status(200).json({ received: true });
  }

  res.status(200).json({ received: true });
};


