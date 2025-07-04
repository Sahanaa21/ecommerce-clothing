import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";

const Navbar = ({ onSearch }) => {
  const { cartItems = [] } = useCart() || {};
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("🚪 Logged out successfully!");
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      navigate(`/?search=${searchQuery}`);
      setSearchQuery("");
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">

        {/* 🛍️ Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img
            src="/logo.png"
            alt="Store Logo"
            className="w-12 h-12 object-contain"
          />
        </Link>

        {/* 🔍 Search */}
        <form onSubmit={handleSearch} className="flex w-full md:w-1/3">
          <input
            type="text"
            placeholder="Search for products, brands and more"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border px-4 py-2 rounded-l-md text-sm focus:outline-none focus:ring focus:border-blue-300"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition text-sm"
          >
            🔍
          </button>
        </form>

        {/* 🔗 User Navigation */}
        <div className="flex items-center gap-4 text-sm md:text-base">
          <Link to="/wishlist" className="hover:underline text-pink-600 font-medium">❤️ Wishlist</Link>
          <Link to="/cart" className="hover:underline text-blue-700 font-medium">🛒 Cart ({cartCount})</Link>

          {isLoggedIn ? (
            <>
              <Link to="/profile" className="hover:underline text-purple-600 font-medium">👤 Profile</Link>
              <button onClick={handleLogout} className="text-red-500 font-medium hover:underline">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline text-blue-500 font-medium">Login</Link>
              <Link to="/register" className="hover:underline text-blue-500 font-medium">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
