import Stripe from "stripe";
import dotenv from "dotenv";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import crypto from "crypto";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// ✅ Create Checkout Session
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
        unit_amount: item.price * 100, // convert ₹ to paisa
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
      metadata: {
        userId: req.user._id.toString(),
        items: JSON.stringify(items),
        address: address,
        designImage: designImage || "",
      },
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("❌ Stripe Checkout Error:", error.message);
    res.status(500).json({ error: "Something went wrong creating checkout session." });
  }
};

// ✅ Webhook Handler - Save Order After Stripe Payment
export const saveOrderAfterPayment = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ Handle payment success
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      const userId = session.metadata.userId;
      const items = JSON.parse(session.metadata.items);
      const address = session.metadata.address;
      const designImage = session.metadata.designImage;

      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const order = new Order({
        user: userId,
        items: items.map((item) => ({
          product: item._id,
          quantity: item.quantity,
          variant: item.variant || {},
        })),
        total,
        status: "Processing",
        address,
        designImage,
      });

      await order.save();

      console.log("✅ Order saved successfully after Stripe payment");
      res.status(200).end();

    } catch (err) {
      console.error("❌ Failed to save order:", err.message);
      res.status(500).json({ error: "Failed to save order after payment" });
    }
  } else {
   res.status(200).end();

  }
};

// ✅ Alias for route handler
export const handleStripeWebhook = saveOrderAfterPayment;
