// controllers/adminController.js

import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

// ✅ Admin Dashboard Stats
export const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const orders = await Order.find();

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    res.json({ totalUsers, totalOrders, totalProducts, totalRevenue });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Dashboard fetch failed", error: err.message });
  }
};

// ✅ Admin: Get All Users (no passwords)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("User fetch error:", err);
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
};
