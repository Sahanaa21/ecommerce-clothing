import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [sort, setSort] = useState("none");

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const search = searchParams.get("search")?.toLowerCase() || "";
  const categoryFromUrl = searchParams.get("category");
  const [category, setCategory] = useState(categoryFromUrl || "All");

  const { addToCart } = useCart();
  const { toggleWishlist, wishlist = [] } = useWishlist();
  const isInWishlist = (id) => wishlist.some((item) => item._id === id);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = {};
        if (category !== "All") params.category = category.toLowerCase();
        if (sort === "price-asc") params.sort = "asc";
        if (sort === "price-desc") params.sort = "desc";
        if (sort === "name-asc") params.sort = "name-asc";
        if (sort === "name-desc") params.sort = "name-desc";
        if (search) params.search = search;

        const res = await axios.get("/products", { params });
        setProducts(res.data);
      } catch (err) {
        console.error("Product fetch error:", err);
        toast.error("Failed to load products.");
      }
    };

    fetchProducts();
  }, [category, sort, search]);

  // 💥 Sync category with URL query
  useEffect(() => {
    if (categoryFromUrl && categoryFromUrl !== category) {
      setCategory(categoryFromUrl);
    }
    // eslint-disable-next-line
  }, [categoryFromUrl]);

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    const query = new URLSearchParams(location.search);
    if (cat === "All") {
      query.delete("category");
    } else {
      query.set("category", cat);
    }
    navigate({ pathname: "/", search: query.toString() });
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart 🛒`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* 🔘 Category + Sort */}
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <div className="flex gap-4 flex-wrap">
          {["All", "Men", "Women", "Kids"].map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-full border font-medium transition ${
                category === cat
                  ? "bg-blue-600 text-white shadow"
                  : "bg-white text-blue-600 border-blue-600 hover:bg-blue-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border px-4 py-2 rounded shadow text-gray-700 focus:outline-blue-500"
        >
          <option value="none">Sort By</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name-asc">Name: A - Z</option>
          <option value="name-desc">Name: Z - A</option>
        </select>
      </div>

      {/* 🛍️ Product Grid */}
      {products.length === 0 ? (
        <div className="text-center text-gray-600 py-20">
          No products found 😢
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {products.map((product) => {
            const price = product.variants?.[0]?.price || product.price || 0;
            const imageUrl = product.baseImage?.startsWith("http")
              ? product.baseImage
              : `https://ecommerce-clothing-lwhf.onrender.com${product.baseImage}`;

            return (
              <div
                key={product._id}
                className="bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition duration-300 group relative"
              >
                <div className="absolute top-2 left-2 bg-yellow-400 text-white text-xs font-semibold px-2 py-0.5 rounded z-10">
                  New
                </div>

                <div
                  className="relative overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/products/${product._id}`)}
                >
                  <img
                    src={imageUrl}
                    alt={product.name}
                    onError={(e) => (e.target.src = "/placeholder.png")}
                    className="w-full h-56 object-cover transform group-hover:scale-105 transition duration-300"
                  />
                </div>

                <div className="p-3">
                  <h3
                    onClick={() => navigate(`/products/${product._id}`)}
                    className="text-base font-semibold text-gray-800 truncate cursor-pointer hover:text-blue-500"
                  >
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 truncate">{product.description}</p>
                  <p className="text-blue-600 font-bold text-lg mt-2">₹{price}</p>

                  <div className="mt-3 flex justify-between gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-green-600 text-white text-sm py-1.5 rounded hover:bg-green-700 transition"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => toggleWishlist(product)}
                      className={`flex-1 text-sm py-1.5 rounded transition ${
                        isInWishlist(product._id)
                          ? "bg-gray-300 text-gray-700 hover:bg-gray-400"
                          : "bg-pink-500 text-white hover:bg-pink-600"
                      }`}
                    >
                      {isInWishlist(product._id) ? "💔 Remove" : "❤️ Wishlist"}
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

export default ProductList;
