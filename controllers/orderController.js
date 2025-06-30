import Order from "../models/Order.js";
import Product from "../models/Product.js";
import generateInvoice from "../utils/generateInvoice.js";

// ✅ Create Order with product snapshot
export const createOrder = async (req, res) => {
  try {
    const { items, total, address, designImage } = req.body;

    if (!items?.length || !total || !address) {
      return res.status(400).json({ message: "Missing order details" });
    }

    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + 5);

    // ✅ FIXED: Use correct product ID from item.product
    const populatedItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product); // ✅ FIXED (was item._id)
        if (!product) throw new Error(`Product not found: ${item.product}`);

        return {
          product: product._id,
          name: product.name,
          baseImage: product.baseImage || product.image || "",
          price: product.price,
          quantity: item.quantity,
          variant: {
            size: item.variant?.size || "N/A",
            color: item.variant?.color || "N/A",
          },
        };
      })
    );

    const newOrder = new Order({
      user: req.user._id,
      items: populatedItems,
      total,
      address,
      designImage,
      expectedDelivery,
    });

    await newOrder.save();
    res.status(201).json({ message: "✅ Order placed", order: newOrder });
  } catch (err) {
    console.error("❌ Order creation error:", err);
    res.status(500).json({ message: "Failed to place order", error: err.message });
  }
};

// ✅ Get User Orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("❌ Fetching user orders failed:", err);
    res.status(500).json({ message: "Failed to fetch your orders" });
  }
};

// ✅ Get All Orders (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const search = req.query.search || "";

    const query = search
      ? {
          $or: [
            { "user.name": { $regex: search, $options: "i" } },
            { "user.email": { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limit);

    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ orders, totalPages });
  } catch (err) {
    console.error("❌ Fetching all orders failed:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// ✅ Update Order Status (Admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status || order.status;
    await order.save();

    res.json({ message: "✅ Order status updated", order });
  } catch (err) {
    res.status(500).json({ message: "❌ Failed to update order", error: err.message });
  }
};

// ✅ Download Invoice
export const downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");

    if (!order) return res.status(404).json({ message: "Order not found" });

    const isOwner = order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.isAdmin;

    if (!isOwner && !isAdmin)
      return res.status(403).json({ message: "Unauthorized to download this invoice" });

    generateInvoice(order, res);
  } catch (err) {
    console.error("❌ Invoice error:", err);
    res.status(500).json({ message: "Failed to generate invoice" });
  }
};
