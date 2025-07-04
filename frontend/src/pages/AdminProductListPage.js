import React, { useEffect, useState } from "react";
import axios from "../utils/axios"; // ✅ Centralized Axios instance
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AdminProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/products");
      setProducts(data);
      setFiltered(data);
    } catch (err) {
      console.error("Product fetch error:", err);
      toast.error("❌ Failed to fetch products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 🔍 Dynamic filtering based on search & category
  useEffect(() => {
    let result = [...products];
    if (search.trim()) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (category !== "all") {
      result = result.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }
    setFiltered(result);
  }, [search, category, products]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("🗑️ Product deleted");
      fetchProducts();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err?.response?.data?.message || "❌ Delete failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold mb-6 text-center text-red-700">
        🧰 Admin Product Manager
      </h2>

      {/* 🔍 Search & Category Filter */}
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Search by product name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded w-full sm:w-64"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border px-4 py-2 rounded w-full sm:w-48"
        >
          <option value="all">All Categories</option>
          <option value="men">Men</option>
          <option value="women">Women</option>
          <option value="kids">Kids</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => {
            const firstVariant = product.variants?.[0] || {};
            const imageUrl = product.baseImage?.startsWith("http")
              ? product.baseImage
              : `https://ecommerce-clothing-lwhf.onrender.com${product.baseImage}`;

            return (
              <div
                key={product._id}
                className="border shadow rounded-lg overflow-hidden bg-white"
              >
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="h-48 w-full object-contain border-b"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">
                    {product.category}
                  </p>
                  <p className="text-blue-600 font-bold mt-2">
                    ₹{firstVariant.price || 0}
                  </p>
                  <p className="text-sm text-gray-500">
                    Stock: {firstVariant.stock || 0}
                  </p>

                  <div className="mt-4 flex justify-between gap-2">
                    <button
                      onClick={() =>
                        navigate(`/admin/products/${product._id}/edit`)
                      }
                      className="bg-yellow-500 text-white px-3 py-1.5 rounded hover:bg-yellow-600"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700"
                    >
                      🗑️ Delete
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

export default AdminProductListPage;
