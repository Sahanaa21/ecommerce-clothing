import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

export const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const orders = await Order.find();

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    res.json({ totalUsers, totalOrders, totalProducts, totalRevenue });
  } catch (err) {
    res.status(500).json({ message: "Dashboard fetch failed" });
  }
};
 // Get all users (for admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};
