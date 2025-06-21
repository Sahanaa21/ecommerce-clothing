import Stripe from "stripe";
import dotenv from "dotenv";
import Order from "../models/Order.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 🧾 Create Stripe checkout session
export const createCheckoutSession = async (req, res) => {
  try {
    const { items, address, designImage } = req.body;

    const line_items = items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100, // in paise
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "upi"],
      line_items,
      mode: "payment",
      success_url: `http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3000/checkout`,
      metadata: {
        address,
        designImage,
        userId: req.user._id.toString(),
        rawOrder: JSON.stringify(items),
      },
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ message: "Failed to create payment session" });
  }
};
// 🎯 POST /api/payments/save-order
export const saveOrderAfterPayment = async (req, res) => {
  const { session_id } = req.body;

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const items = JSON.parse(session.metadata.rawOrder);

    const newOrder = new Order({
      user: session.metadata.userId,
      items: items.map((item) => ({
        product: null, // optional: link later
        quantity: item.quantity,
      })),
      total: session.amount_total / 100,
      address: session.metadata.address,
      designImage: session.metadata.designImage || "",
      status: "Processing",
    });

    await newOrder.save();
    res.status(201).json({ message: "Order saved", orderId: newOrder._id });
  } catch (err) {
    console.error("Save order error:", err);
    res.status(500).json({ message: "Failed to save order" });
  }
};
