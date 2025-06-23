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
  const unitAmount = parseInt(item.price * 100);

  if (isNaN(unitAmount)) {
    throw new Error(`❌ Invalid price for item: ${item.name}`);
  }

  return {
    price_data: {
      currency: "inr",
      product_data: {
        name: item.name,
      },
      unit_amount: unitAmount, // always a valid integer
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
  try {
    const event = req.body;

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata.userId;
      const address = session.metadata.address;
      const designImage = session.metadata.designImage;
      const items = JSON.parse(session.metadata.items || "[]");

      const total = session.amount_total / 100;

      const newOrder = new Order({
        user: userId,
        items,
        total,
        address,
        designImage,
        status: "Paid",
        paymentIntentId: session.payment_intent,
      });

      await newOrder.save();
      console.log("✅ Order saved after Stripe payment");
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("❌ Stripe Webhook Error:", err);
    res.status(400).send("Webhook Error");
  }
};
