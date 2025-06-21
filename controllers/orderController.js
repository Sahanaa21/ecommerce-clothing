import Order from "../models/Order.js";

// ✅ Create a new order
export const createOrder = async (req, res) => {
  try {
    const { items, total, address, designImage } = req.body;

    const newOrder = new Order({
      user: req.user._id,
      items,
      total,
      address,
      designImage, // ✅ Save design image if provided
    });

    await newOrder.save();
    res.status(201).json({ message: "Order placed", order: newOrder });
  } catch (err) {
    console.error("Order error:", err);
    res.status(500).json({ message: "Failed to place order", error: err.message });
  }
};


// ✅ Get logged-in user's orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.product", "name image price") // ✅ Include product details
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("❌ Fetching user orders failed:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// ✅ Admin: Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email") // ✅ show user info
      .populate("items.product", "name image price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("❌ Failed to fetch admin orders:", err.message);
    res.status(500).json({ message: "Failed to load orders" });
  }
};

// ✅ Admin: Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (err) {
    console.error("❌ Failed to update order status:", err.message);
    res.status(500).json({ message: "Failed to update status" });
  }
};
