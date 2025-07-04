import React from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CartPage = () => {
  const {
    cartItems = [],
    increaseQty,
    decreaseQty,
    removeFromCart,
    clearCart,
  } = useCart();
  const navigate = useNavigate();

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + (item.variant?.price || 0) * item.quantity,
      0
    );
  };

  const handleRemove = (key) => {
    removeFromCart(key);
    toast.info("❌ Item removed from cart");
  };

  const handleClearCart = () => {
    clearCart();
    toast.warn("🧹 Cart cleared");
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty!");
      return;
    }
    navigate("/checkout");
    toast.success("Redirecting to checkout...");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold mb-8 text-center">🛒 Your Cart</h2>

      {cartItems.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">Your cart is empty 😿</p>
      ) : (
        <>
          <div className="grid gap-6">
            {cartItems.map((item) => (
              <div
                key={item.key}
                className="flex flex-col md:flex-row gap-4 border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
              >
                <img
                  src={
                    item.baseImage?.startsWith("http")
                      ? item.baseImage
                      : `https://ecommerce-clothing-lwhf.onrender.com${item.baseImage}`
                  }
                  alt={item.name}
                  className="w-full md:w-32 h-32 object-contain rounded"
                />

                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    Size: {item.variant?.size || "N/A"}, Color: {item.variant?.color || "N/A"}
                  </p>
                  <p className="text-blue-600 font-bold text-lg">
                    ₹{item.variant?.price || 0}
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => decreaseQty(item.key)}
                      className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                    >
                      ➖
                    </button>
                    <span className="font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => increaseQty(item.key)}
                      className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                    >
                      ➕
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemove(item.key)}
                    className="mt-4 text-sm text-red-600 hover:underline"
                  >
                    ❌ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 🧾 Summary Section */}
          <div className="mt-10 border-t pt-6 text-right">
            <h3 className="text-xl font-bold mb-4">
              Total: ₹{getTotalPrice().toLocaleString()}
            </h3>
            <div className="flex justify-end gap-4 flex-wrap">
              <button
                onClick={handleClearCart}
                className="bg-gray-700 text-white px-6 py-2 rounded hover:bg-gray-800"
              >
                🧹 Clear Cart
              </button>
              <button
                onClick={handleCheckout}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              >
                ✅ Proceed to Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
