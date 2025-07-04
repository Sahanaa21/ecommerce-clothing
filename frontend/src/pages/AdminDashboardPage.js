import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  PackageCheck,
  IndianRupee,
  Users,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444"];

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchStats = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    }
  };

  const fetchDailyRevenue = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/admin/orders/daily-revenue", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDailyRevenue(data);
    } catch (err) {
      console.error("Failed to fetch daily revenue", err);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchDailyRevenue()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, // eslint-disable-next-line
  []);

  if (!stats || loading) return <p className="text-center mt-10">Loading dashboard...</p>;

  const chartData = [
    { name: "Users", value: stats.totalUsers },
    { name: "Orders", value: stats.totalOrders },
    { name: "Products", value: stats.totalProducts },
    { name: "Revenue (k)", value: stats.totalRevenue / 1000 },
  ];

  const monthlyData = Object.entries(stats.monthlyRevenue || {}).map(
    ([month, value]) => ({ name: month, value })
  );

  const pieData = Object.entries(stats.salesByCategory || {}).map(
    ([category, value]) => ({ name: category, value })
  );

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-red-600">📊 Admin Dashboard</h2>
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded shadow"
        >
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white shadow p-6 rounded-lg text-center">
          <Users className="mx-auto mb-2 text-blue-500" />
          <p className="text-sm text-gray-500">Users</p>
          <p className="text-xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="bg-white shadow p-6 rounded-lg text-center">
          <ShoppingCart className="mx-auto mb-2 text-purple-500" />
          <p className="text-sm text-gray-500">Orders</p>
          <p className="text-xl font-bold">{stats.totalOrders}</p>
        </div>
        <div className="bg-white shadow p-6 rounded-lg text-center">
          <PackageCheck className="mx-auto mb-2 text-green-500" />
          <p className="text-sm text-gray-500">Products</p>
          <p className="text-xl font-bold">{stats.totalProducts}</p>
        </div>
        <div className="bg-white shadow p-6 rounded-lg text-center">
          <IndianRupee className="mx-auto mb-2 text-yellow-500" />
          <p className="text-sm text-gray-500">Revenue</p>
          <p className="text-xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Overview Bar Chart */}
      <div className="bg-white shadow p-6 rounded-lg mb-10">
        <h3 className="text-lg font-bold mb-4">📈 Overview</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Revenue */}
      <div className="bg-white shadow p-6 rounded-lg mb-10">
        <h3 className="text-lg font-bold mb-4">📆 Monthly Revenue</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthlyData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Daily Revenue Line Chart */}
      <div className="bg-white shadow p-6 rounded-lg mb-10">
        <h3 className="text-lg font-bold mb-4">📅 Daily Revenue</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={dailyRevenue}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ r: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Sales by Category Pie Chart */}
      <div className="bg-white shadow p-6 rounded-lg mb-10">
        <h3 className="text-lg font-bold mb-4">🛍️ Sales by Category</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <Link
          to="/admin/products"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
        >
          🛍️ Manage Products
        </Link>
        <Link
          to="/admin/orders"
          className="bg-purple-600 text-white px-6 py-3 rounded-lg shadow hover:bg-purple-700 transition"
        >
          📦 View Orders
        </Link>
        <Link
          to="/admin/upload"
          className="bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700 transition"
        >
          ⬆️ Upload Product
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
