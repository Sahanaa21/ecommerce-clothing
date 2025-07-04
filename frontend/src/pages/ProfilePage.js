import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation, Link } from "react-router-dom";
import OrderHistoryPage from "./OrderHistoryPage";
import SavedAddressesTab from "../components/SavedAddressesTab";

const ProfilePage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("info");

  // 🔄 Set tab from URL param (only once on mount)
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tabFromUrl = queryParams.get("tab");
    if (tabFromUrl) setActiveTab(tabFromUrl);
  }, [location.search]);

  if (!user) {
    return (
      <div className="text-center mt-10">
        <p className="text-gray-500">🔐 You need to be logged in to view this page.</p>
        <Link to="/login" className="text-blue-600 underline mt-4 inline-block">
          → Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">
        👤 My Profile
      </h2>

      {/* 🔄 Tabs */}
      <div className="flex justify-center mb-6 gap-4 flex-wrap">
        {["info", "address", "orders"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full font-medium transition ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {tab === "info" && "Personal Info"}
            {tab === "address" && "Saved Address"}
            {tab === "orders" && "Order History"}
          </button>
        ))}

        {user.isAdmin && (
          <button
            onClick={() => setActiveTab("admin")}
            className={`px-4 py-2 rounded-full font-medium transition ${
              activeTab === "admin"
                ? "bg-red-600 text-white"
                : "bg-red-100 text-red-700 hover:bg-red-200"
            }`}
          >
            Admin Panel
          </button>
        )}
      </div>

      {/* 📄 Tab Content */}
      <div className="bg-white shadow-md rounded-lg p-6">
        {activeTab === "info" && (
          <div className="flex flex-col md:flex-row items-center gap-6">
            <img
              src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border"
            />
            <div className="space-y-2">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.isAdmin ? "Admin 👑" : "Customer"}</p>
            </div>
          </div>
        )}

        {activeTab === "address" && <SavedAddressesTab />}
        {activeTab === "orders" && <OrderHistoryPage />}

        {activeTab === "admin" && user.isAdmin && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-3 text-red-600">
              Admin Panel
            </h3>
            <div className="space-y-3">
              <Link to="/admin/upload" className="block text-blue-600 underline">
                ➕ Upload New Product
              </Link>
              <Link to="/admin/products" className="block text-blue-600 underline">
                📦 Manage Products
              </Link>
              <Link to="/admin/orders" className="block text-blue-600 underline">
                📋 View All Orders
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
