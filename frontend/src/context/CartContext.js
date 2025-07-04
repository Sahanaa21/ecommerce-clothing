import { createContext, useContext, useState } from "react";
import axios from "../utils/axios";
import { toast } from "react-toastify";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const fetchFreshProduct = async (productId) => {
    try {
      const res = await axios.get(`/products/${productId}`);
      return res.data;
    } catch (err) {
      console.error("❌ Failed to fetch product:", err);
      return null;
    }
  };

  const addToCart = async (product) => {
    const variant = product.variant || product.selectedVariant || {};
    const variantKey = `${product._id}-${variant.size || "default"}-${variant.color || "default"}`;
    const exists = cartItems.find((item) => item.key === variantKey);

    const latest = await fetchFreshProduct(product._id);
    if (!latest) {
      return toast.error("❌ Product not available");
    }

    const matchedVariant = latest.variants?.find(
      (v) =>
        v.size?.toLowerCase() === (variant.size || "").toLowerCase() &&
        v.color?.toLowerCase() === (variant.color || "").toLowerCase()
    );

    if (!matchedVariant) {
      return toast.error("❌ Variant not found or no longer available");
    }

    if (matchedVariant.stock <= 0) {
      return toast.warning("⚠️ This item is currently out of stock.");
    }

    const itemToAdd = {
      key: variantKey,
      _id: latest._id,
      name: latest.name,
      baseImage: latest.baseImage || latest.image || "",
      variant: {
        size: matchedVariant.size,
        color: matchedVariant.color,
        price: matchedVariant.price,
        stock: matchedVariant.stock,
      },
      quantity: 1,
    };

    if (exists) {
      const updated = cartItems.map((item) =>
        item.key === variantKey
          ? {
              ...item,
              quantity:
                item.quantity + 1 <= matchedVariant.stock
                  ? item.quantity + 1
                  : item.quantity,
            }
          : item
      );
      setCartItems(updated);
    } else {
      setCartItems([...cartItems, itemToAdd]);
    }

    toast.success(`🛒 ${latest.name} added to cart`);
  };

  const removeFromCart = (key) => {
    setCartItems((prev) => prev.filter((item) => item.key !== key));
    toast.info("❌ Item removed from cart");
  };

  const increaseQty = (key) => {
    const updated = cartItems.map((item) =>
      item.key === key
        ? {
            ...item,
            quantity:
              item.quantity + 1 <= item.variant.stock
                ? item.quantity + 1
                : item.quantity,
          }
        : item
    );
    setCartItems(updated);
  };

  const decreaseQty = (key) => {
    const updated = cartItems.map((item) =>
      item.key === key && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );
    setCartItems(updated);
  };

  const clearCart = () => {
    setCartItems([]);
    toast.info("🧹 Cart cleared");
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
