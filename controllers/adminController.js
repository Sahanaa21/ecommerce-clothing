import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import mongoose from "mongoose";

// ✅ Admin Dashboard Stats (Enhanced)
export const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const orders = await Order.find({});

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    // 📊 Sales by Category
    const salesByCategory = {};
    for (const order of orders) {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (!product) continue;
        const category = product.category || "Unknown";
        salesByCategory[category] = (salesByCategory[category] || 0) + item.quantity;
      }
    }

    // 📈 Monthly Revenue
    const monthlyRevenue = {};
    for (const order of orders) {
      const month = new Date(order.createdAt).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + order.total;
    }

    res.json({
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue,
      salesByCategory,
      monthlyRevenue,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Dashboard fetch failed", error: err.message });
  }
};

// ✅ Get All Users (no passwords)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("User fetch error:", err);
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
};

// ✅ Get Daily Revenue Chart Data
export const getDailyRevenue = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: 1 });

    const dailyMap = {};
    orders.forEach((order) => {
      const date = new Date(order.createdAt).toISOString().slice(0, 10);
      dailyMap[date] = (dailyMap[date] || 0) + order.total;
    });

    const dailyRevenue = Object.entries(dailyMap).map(([date, total]) => ({
      date,
      total,
    }));

    res.json(dailyRevenue);
  } catch (err) {
    res.status(500).json({ message: "Error calculating revenue", error: err.message });
  }
};

// ✅ Paginated + Searchable Orders List
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 6, search = "" } = req.query;
    const query = {};

    if (search) {
      const regex = new RegExp(search, "i");

      if (mongoose.Types.ObjectId.isValid(search)) {
        query._id = search;
      } else {
        const users = await User.find({
          $or: [{ name: regex }, { email: regex }],
        }).select("_id");

        query.user = { $in: users.map((u) => u._id) };
      }
    }

    const total = await Order.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("user", "name email")
      .populate("items.product", "name");

    res.json({ orders, totalPages });
  } catch (err) {
    console.error("Order fetch error:", err);
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
};
