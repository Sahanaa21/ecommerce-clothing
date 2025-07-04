import React, { useEffect, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { toast } from "react-toastify";
import { useWishlist } from "../context/WishlistContext";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  const { wishlist = [], toggleWishlist } = useWishlist();
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    const isWished = wishlist.some((item) => item._id === product._id);
    setWishlisted(isWished);
  }, [wishlist, product._id]);

  const handleWishlistClick = (e) => {
    e.preventDefault(); // Prevent navigating while clicking wishlist
    toggleWishlist(product);
    setWishlisted((prev) => !prev);
  };

  const displayImage =
    product.variants?.[0]?.image || product.baseImage || "/default-product.png";

  const displayPrice =
    product.variants?.length > 0
      ? Math.min(...product.variants.map((v) => Number(v.price) || 0))
      : product.price !== undefined && product.price >= 0
        ? product.price
        : null;

  const sizeSet = new Set(product.variants?.map((v) => v.size));
  const colorSet = new Set(product.variants?.map((v) => v.color));

  return (
    <Link
      to={`/products/${product._id}`}
      className="border rounded shadow-md p-4 relative hover:shadow-lg transition duration-300 group block"
    >
      <img
        src={`http://localhost:5000${displayImage}`}
        alt={product.name}
        className="w-full h-48 object-cover rounded"
      />
      <h3 className="mt-2 font-bold text-lg">{product.name}</h3>
      <p className="text-gray-700 font-medium">
        {displayPrice !== null
          ? `Starting from ₹${displayPrice}`
          : "Price not available"}
      </p>

      <div className="text-sm text-gray-600 mt-1 hidden group-hover:block">
        {sizeSet.size > 0 && <p>Sizes: {[...sizeSet].join(", ")}</p>}
        {colorSet.size > 0 && <p>Colors: {[...colorSet].join(", ")}</p>}
      </div>

      <button
        onClick={handleWishlistClick}
        className="absolute top-2 right-2 text-red-500 text-xl"
        aria-label="Toggle Wishlist"
      >
        {wishlisted ? <FaHeart /> : <FaRegHeart />}
      </button>
    </Link>
  );
};

export default ProductCard;
