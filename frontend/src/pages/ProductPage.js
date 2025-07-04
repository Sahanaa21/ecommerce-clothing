import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/axios";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { toast } from "react-toastify";

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const { addToCart } = useCart();
  const { toggleWishlist, wishlist = [] } = useWishlist();

  const wishlisted = wishlist.some((item) => item._id === id);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        toast.error("❌ Failed to load product");
      }
    };

    fetchProduct();
  }, [id]);

  if (!product) {
    return <div className="text-center py-20 text-gray-500">Loading product...</div>;
  }

  const sizes = [...new Set(product.variants.map((v) => v.size))];
  const colors = [...new Set(product.variants.map((v) => v.color))];

  const selectedVariant = product.variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("❗ Please select size and color");
      return;
    }

    if (selectedVariant.stock <= 0) {
      toast.error("❌ Out of Stock");
      return;
    }

    const cartProduct = {
      _id: product._id,
      name: product.name,
      baseImage: product.baseImage,
      variant: selectedVariant,
      quantity: 1,
    };

    addToCart(cartProduct);
    toast.success("✅ Added to cart");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-2 gap-8">
        {/* 📸 Image */}
        <div>
          <img
            src={
              product.baseImage?.startsWith("http")
                ? product.baseImage
                : `https://ecommerce-clothing-lwhf.onrender.com${product.baseImage}`
            }
            alt={product.name}
            className="h-48 w-full object-contain"
          />
        </div>

        {/* 📝 Info */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <p className="text-sm text-gray-500 mb-2 capitalize">Category: {product.category}</p>

          {/* 🧵 Size Selection */}
          <div className="mb-4">
            <h4 className="font-medium mb-1">Select Size:</h4>
            <div className="flex gap-2 flex-wrap">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1 rounded border ${
                    selectedSize === size
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* 🎨 Color Selection */}
          <div className="mb-4">
            <h4 className="font-medium mb-1">Select Color:</h4>
            <div className="flex gap-2 flex-wrap">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-3 py-1 rounded border ${
                    selectedColor === color
                      ? "bg-green-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* 💰 Price + Stock */}
          {selectedVariant && (
            <div className="mb-4">
              <p className="text-lg font-bold text-blue-700">
                Price: ₹{selectedVariant.price}
              </p>
              <p className="text-sm text-gray-600">
                Stock: {selectedVariant.stock > 0 ? selectedVariant.stock : "Out of Stock"}
              </p>
            </div>
          )}

          {/* 🛒 Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleAddToCart}
              className={`px-6 py-2 rounded transition ${
                selectedVariant?.stock <= 0
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              disabled={selectedVariant?.stock <= 0}
            >
              {selectedVariant?.stock <= 0 ? "Out of Stock" : "Add to Cart"}
            </button>

            <button
              onClick={() => toggleWishlist(product)}
              className={`px-6 py-2 rounded border transition ${
                wishlisted
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-pink-500 text-white hover:bg-pink-600"
              }`}
            >
              {wishlisted ? "💔 Remove" : "❤️ Wishlist"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
