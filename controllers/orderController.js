import Order from "../models/Order.js";

// ✅ Create a new order
export const createOrder = async (req, res) => {
  try {
    const { items, total, address, designImage } = req.body;

    if (!items?.length || !total || !address) {
      return res.status(400).json({ message: "Missing order details" });
    }

    const newOrder = new Order({
      user: req.user._id,
      items,
      total,
      address,
      designImage, // Optional design image
    });

    await newOrder.save();
    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (err) {
    console.error("❌ Order creation error:", err);
    res.status(500).json({ message: "Failed to place order", error: err.message });
  }
};

// ✅ Get orders for the logged-in user
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.product", "name image price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("❌ Fetching user orders failed:", err);
    res.status(500).json({ message: "Failed to fetch your orders" });
  }
};

// ✅ Admin: Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name image price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("❌ Admin fetch orders failed:", err.message);
    res.status(500).json({ message: "Failed to load all orders" });
  }
};

// ✅ Admin: Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (err) {
    console.error("❌ Update order status failed:", err.message);
    res.status(500).json({ message: "Failed to update order status" });
  }
};
