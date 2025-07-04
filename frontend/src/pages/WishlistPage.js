import React, { useEffect, useState } from "react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import axios from "axios";

const WishlistPage = () => {
  const {
    wishlist = [],
    removeFromWishlist,
    fetchWishlist,
  } = useWishlist();

  const { addToCart } = useCart();
  const [freshProducts, setFreshProducts] = useState([]);

  useEffect(() => {
    fetchWishlist?.(); // 🔄 Re-fetch wishlist
  }, [fetchWishlist]);

  useEffect(() => {
    const fetchFreshDetails = async () => {
      try {
        if (!Array.isArray(wishlist) || wishlist.length === 0) {
          setFreshProducts([]);
          return;
        }

        const updated = await Promise.all(
          wishlist.map(async (item) => {
            try {
              const res = await axios.get(
                `https://ecommerce-clothing-lwhf.onrender.com/api/products/${item._id}`
              );
              return res.data;
            } catch {
              return null; // If product no longer exists
            }
          })
        );
        setFreshProducts(updated.filter(Boolean));
      } catch (err) {
        console.error("❌ Failed to fetch wishlist products:", err);
        toast.error("Failed to load wishlist items");
        setFreshProducts([]);
      }
    };

    fetchFreshDetails();
  }, [wishlist]);

  const handleAddToCart = (product) => {
    if (!product) return;
    const price = product?.price || product?.variants?.[0]?.price || 0;
    addToCart({ ...product, price });
    toast.success(`🛒 ${product.name} added to cart`);
  };

  const handleRemove = (product) => {
    if (!product) return;
    removeFromWishlist(product._id);
    toast.info(`❌ ${product.name} removed from wishlist`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-4xl font-bold text-blue-700 mb-8 text-center">
        💖 Your Wishlist
      </h2>

      {freshProducts.length === 0 ? (
        <div className="text-center text-gray-600 text-lg mt-12">
          Your wishlist is empty 😿 <br />
          Browse and add your favorites!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {freshProducts.map((product) => {
            if (!product || !product._id) return null;

            const price = product?.price || product?.variants?.[0]?.price || 0;
            const imagePath = product.baseImage || product.image || "";
            const imageUrl = imagePath.startsWith("http")
              ? imagePath
              : `https://ecommerce-clothing-lwhf.onrender.com${imagePath}`;

            return (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300 flex flex-col"
              >
                <img
                  src={imageUrl}
                  alt={product.name || "Product"}
                  className="h-48 w-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/no-image.jpg";
                  }}
                />

                <div className="p-4 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {product.name || "Unnamed Product"}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 truncate">
                      {product.description || "No description available."}
                    </p>
                    <p className="text-blue-600 font-bold text-lg mb-3">
                      ₹{price}
                    </p>
                  </div>

                  <div className="flex justify-between gap-2 mt-auto">
                    <button
                      className="flex-1 bg-green-600 text-white text-sm px-3 py-2 rounded hover:bg-green-700 transition"
                      onClick={() => handleAddToCart(product)}
                    >
                      🛒 Add to Cart
                    </button>
                    <button
                      className="flex-1 text-sm text-red-600 hover:underline"
                      onClick={() => handleRemove(product)}
                    >
                      ❌ Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
