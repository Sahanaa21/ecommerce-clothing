import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart(); // 🧹 Clear the cart on mount
    toast.success("🎉 Order placed successfully!");

    const timer = setTimeout(() => {
      navigate("/profile");
    }, 3000); // ⏱ Redirect to profile after 3 seconds

    return () => clearTimeout(timer);
  }, [navigate, clearCart]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-green-50 text-center px-4">
      <div className="bg-white p-10 rounded shadow-md max-w-lg w-full">
        <h1 className="text-3xl font-bold text-green-700 mb-4">✅ Order Successful!</h1>
        <p className="text-lg text-gray-700 mb-2">
          Thank you for your purchase.
        </p>
        <p className="text-gray-500">
          You will be redirected to your profile shortly...
        </p>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
