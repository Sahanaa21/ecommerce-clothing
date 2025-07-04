import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "../utils/axios";
import { toast } from "react-toastify";

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const token = localStorage.getItem("token");

  const fetchWishlist = useCallback(async () => {
    if (!token) return;

    try {
      const { data } = await axios.get("/users/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const refreshed = await Promise.all(
        data.map(async (item) => {
          const res = await axios.get(`/products/${item._id}`);
          return {
            ...res.data,
            variant: item.variant || {},
          };
        })
      );

      setWishlist(refreshed);
    } catch (err) {
      console.error("❌ Wishlist fetch failed:", err);
      toast.error("Failed to fetch wishlist items");
    }
  }, [token]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = async (product) => {
    if (!token) return toast.error("Login to use wishlist");

    try {
      const variant = product.variant || product.selectedVariant || {};
      const key = `${product._id}-${variant.size || "default"}-${variant.color || "default"}`;

      const res = await axios.post(
        `/users/wishlist/${product._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const isAdded = res.data.message === "Added to wishlist";

      if (isAdded) {
        const updatedRes = await axios.get(`/products/${product._id}`);
        const freshProduct = updatedRes.data;

        const updatedProduct = {
          ...freshProduct,
          variant: {
            size: variant.size || "Free Size",
            color: variant.color || "Standard",
            price:
              variant.price ||
              freshProduct.variants?.[0]?.price ||
              0,
          },
        };

        setWishlist((prev) => [...prev, updatedProduct]);
        toast.success(`💖 ${freshProduct.name} added to wishlist`);
      } else {
        setWishlist((prev) =>
          prev.filter((item) => {
            const itemKey = `${item._id}-${item.variant?.size || "default"}-${item.variant?.color || "default"}`;
            return itemKey !== key;
          })
        );
        toast.info(`❌ ${product.name} removed from wishlist`);
      }
    } catch (err) {
      console.error("❌ Toggle wishlist error:", err);
      toast.error("Wishlist update failed");
    }
  };

  const removeFromWishlist = async (id) => {
    if (!token) return;

    try {
      await axios.post(
        `/users/wishlist/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWishlist((prev) => prev.filter((item) => item._id !== id));
      toast.info("❌ Removed from wishlist");
    } catch (err) {
      console.error("❌ Remove wishlist error:", err);
      toast.error("Failed to remove from wishlist");
    }
  };

  const clearWishlist = () => setWishlist([]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
