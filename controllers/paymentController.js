import Stripe from "stripe";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js"; // ✅ Needed for stock update

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
        unit_amount: item.price * 100,
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

// ✅ Stripe Webhook - Save Order + Deduct Stock
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

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
        user: new mongoose.Types.ObjectId(userId),
        items: items.map((item) => ({
  product: new mongoose.Types.ObjectId(item._id),
  name: item.name,
  baseImage: item.baseImage || item.image || "",
  price: item.price,
  quantity: item.quantity,
  variant: item.variant || {},
}))
,
        total,
        address,
        designImage,
        expectedDelivery,
        status: "Processing",
      });

      await newOrder.save();

      // ✅ Deduct stock from each product
      for (const item of items) {
        const product = await Product.findById(item._id);
        if (!product) continue;

        // ✅ Variant-aware stock deduction (if applicable)
        if (product.variants && product.variants.length > 0 && item.variant?.size && item.variant?.color) {
          const variantIndex = product.variants.findIndex(
            (v) => v.size === item.variant.size && v.color === item.variant.color
          );

          if (variantIndex >= 0) {
            product.variants[variantIndex].stock = Math.max(
              0,
              product.variants[variantIndex].stock - item.quantity
            );
          }
        } else {
          // Basic stock (for non-variant products)
          product.stock = Math.max(0, (product.stock || 0) - item.quantity);
        }

        await product.save();
      }

      console.log("✅ Order saved & stock updated.");
      res.status(200).end();
    } catch (err) {
      console.error("❌ Order save or stock update failed:", err.message);
      res.status(500).json({ error: "Failed to save order or update stock" });
    }
  } else {
    res.status(200).end();
  }
};
