import Stripe from "stripe";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Order from "../models/Order.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// ✅ Create Stripe Checkout Session
export const createCheckoutSession = async (req, res) => {
  try {
    const { items, address, designImage } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const lineItems = items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100, // ₹ to paisa
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${CLIENT_URL}/profile?tab=orders`,
      cancel_url: `${CLIENT_URL}/checkout`,
      metadata: {
        userId: req.user._id.toString(),
        items: JSON.stringify(items),
        address,
        designImage: designImage || "",
      },
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("❌ Stripe Checkout Error:", error.message);
    res.status(500).json({ error: "Something went wrong creating checkout session." });
  }
};

// ✅ Stripe Webhook - Save Order after Payment
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Only handle successful payments
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      const userId = session.metadata.userId;
      const items = JSON.parse(session.metadata.items);
      const address = session.metadata.address;
      const designImage = session.metadata.designImage;

      const total = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const expectedDelivery = new Date();
      expectedDelivery.setDate(expectedDelivery.getDate() + 5);

      const newOrder = new Order({
        user: mongoose.Types.ObjectId(userId),
        items: items.map((item) => ({
  product: item._id, // ✅ Use as-is if _id is already string
  quantity: item.quantity,
  variant: item.variant || {},
})),
        total,
        address,
        designImage,
        expectedDelivery,
        status: "Processing",
      });

      await newOrder.save();

      console.log("✅ Order saved to DB after Stripe payment.");
      res.status(200).end();
    } catch (err) {
      console.error("❌ Order save failed after Stripe payment:", err.message);
      res.status(500).json({ error: "Failed to save order after payment" });
    }
  } else {
    res.status(200).end(); // accept all other events
  }
};
