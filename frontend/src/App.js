import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import HeroBanner from "./components/HeroBanner";
import ProductList from "./components/ProductList";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import WishlistPage from "./pages/WishlistPage";
import ProfilePage from "./pages/ProfilePage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import AdminUploadPage from "./pages/AdminUploadPage";
import AdminProductListPage from "./pages/AdminProductListPage";
import AdminEditProductPage from "./pages/AdminEditProductPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminUserListPage from "./pages/AdminUserListPage";
import AdminOrderListPage from "./pages/AdminOrderListPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import CancelPage from "./pages/CancelPage";
import ProductPage from "./pages/ProductPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";

import ProtectedRoute from "./components/ProtectedRoute";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './index.css';

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <div className="min-h-screen bg-gray-50 text-gray-900">
            <Navbar onSearch={setSearchTerm} />
            {isHomePage && <HeroBanner />}

            <main className="max-w-7xl mx-auto px-4 py-6">
              <ToastContainer position="bottom-right" autoClose={2000} />
              <Routes>
                <Route path="/" element={<ProductList searchTerm={searchTerm} />} />
                <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/wishlist" element={<PrivateRoute><WishlistPage /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                <Route path="/order-success" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
                <Route path="/admin/upload" element={<AdminRoute><AdminUploadPage /></AdminRoute>} />
                <Route path="/admin/products" element={<AdminRoute><AdminProductListPage /></AdminRoute>} />
                <Route path="/admin/products/:id/edit" element={<AdminRoute><AdminEditProductPage /></AdminRoute>} />
                <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><AdminUserListPage /></AdminRoute>} />
                <Route path="/admin/orders" element={<AdminRoute><AdminOrderListPage /></AdminRoute>} />
                <Route path="/success" element={<PaymentSuccessPage />} />
                <Route path="/cancel" element={<CancelPage />} />
                <Route path="/products/:id" element={<ProductPage />} />
                <Route path="/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
              </Routes>
            </main>
          </div>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
