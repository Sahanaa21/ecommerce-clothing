import Order from "../models/Order.js";
import generateInvoice from "../utils/generateInvoice.js";
import Product from "../models/Product.js";

export const createOrder = async (req, res) => {
  try {
    const { items, address, designImage } = req.body;

    if (!items?.length || !address) {
      return res.status(400).json({ message: "Missing order details" });
    }

    // Enrich items from DB
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item._id);
        if (!product) throw new Error(`Product not found: ${item._id}`);

        const matchedVariant = product.variants?.find(
          (v) =>
            v.size?.toLowerCase() === (item.variant?.size || "").toLowerCase() &&
            v.color?.toLowerCase() === (item.variant?.color || "").toLowerCase()
        );

        if (!matchedVariant) {
          console.warn(`⚠️ Variant not found for product ${product._id}`);
        }

        return {
          product: product._id,
          name: product.name,
          quantity: item.quantity,
          price: matchedVariant?.price || 0,
          baseImage:
            matchedVariant?.image || product.baseImage || "/images/no-image.jpg",
          variant: {
            size: matchedVariant?.size || item.variant?.size || "N/A",
            color: matchedVariant?.color || item.variant?.color || "N/A",
          },
        };
      })
    );

    // Calculate total price
    const total = enrichedItems.reduce(
      (sum, item) => sum + (item.price || 0) * item.quantity,
      0
    );

    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + 5);

    const newOrder = new Order({
      user: req.user._id,
      items: enrichedItems,
      total,
      address,
      designImage,
      expectedDelivery,
    });

    await newOrder.save();

    res.status(201).json({
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (err) {
    console.error("❌ Order creation error:", err);
    res.status(500).json({ message: "Failed to place order", error: err.message });
  }
};

// ✅ Get User Orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "name image baseImage price")
      .sort({ createdAt: -1 });

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

// ✅ Update Status (Admin)
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
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product", "name price baseImage");

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
