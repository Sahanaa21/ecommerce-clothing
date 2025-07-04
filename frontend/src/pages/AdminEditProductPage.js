import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AdminEditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    baseImage: "",
  });

  const [variants, setVariants] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🛍️ Fetch existing product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setForm({
          name: data.name || "",
          description: data.description || "",
          category: data.category || "",
          baseImage: data.baseImage || "",
        });

        setVariants(data.variants || []);
        setPreview(data.baseImage);
      } catch (err) {
        console.error("❌ Product fetch error:", err);
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleVariantChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...variants];
    updated[index][name] = value;
    setVariants(updated);
  };

  const addVariant = () => {
    setVariants([...variants, { size: "", color: "", price: "", stock: "" }]);
  };

  const removeVariant = (index) => {
    const updated = [...variants];
    updated.splice(index, 1);
    setVariants(updated);
  };

  const handleImageUpload = async () => {
    if (!image) return null;

    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "ecommerce_uploads");

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dqkul6sto/image/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      return data.secure_url;
    } catch (err) {
      toast.error("❌ Image upload failed");
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      let baseImage = form.baseImage;
      if (image) {
        toast.info("📤 Uploading image...");
        baseImage = await handleImageUpload();
        if (!baseImage) throw new Error("Image upload failed");
      }

      const updatedData = {
        name: form.name,
        description: form.description,
        category: form.category,
        baseImage,
        variants: variants.map((v) => ({
          size: v.size || "Free Size",
          color: v.color || "Standard",
          type: v.type || "Default",
          price: Number(v.price),
          stock: Number(v.stock),
          image: baseImage,
        })),
      };

      await axios.put(`/products/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("✅ Product updated!");
      navigate("/admin/products");
    } catch (err) {
      console.error("❌ Update error:", err?.response?.data || err);
      toast.error(err?.response?.data?.message || "Update failed");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading product...</p>;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">✏️ Edit Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow p-6 rounded">
        <input
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleFormChange}
          className="border p-2 rounded w-full"
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleFormChange}
          className="border p-2 rounded w-full"
          required
        />
        <select
          name="category"
          value={form.category}
          onChange={handleFormChange}
          className="border p-2 rounded w-full"
          required
        >
          <option value="">Select Category</option>
          <option value="Men">Men</option>
          <option value="Women">Women</option>
          <option value="Kids">Kids</option>
        </select>

        {/* 🔧 Variants */}
        <div>
          <h3 className="font-semibold text-lg mb-2">Variants:</h3>
          {variants.map((variant, index) => (
            <div key={index} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
              <input
                type="text"
                name="size"
                placeholder="Size"
                value={variant.size}
                onChange={(e) => handleVariantChange(index, e)}
                className="border p-2 rounded"
                required
              />
              <input
                type="text"
                name="color"
                placeholder="Color"
                value={variant.color}
                onChange={(e) => handleVariantChange(index, e)}
                className="border p-2 rounded"
                required
              />
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={variant.price}
                onChange={(e) => handleVariantChange(index, e)}
                className="border p-2 rounded"
                required
              />
              <input
                type="number"
                name="stock"
                placeholder="Stock"
                value={variant.stock}
                onChange={(e) => handleVariantChange(index, e)}
                className="border p-2 rounded"
                required
              />
              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="text-red-600 text-sm ml-2 col-span-full hover:underline"
                >
                  ❌ Remove Variant
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addVariant}
            className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 text-sm"
          >
            ➕ Add Variant
          </button>
        </div>

        {/* 🖼️ Image */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            setImage(e.target.files[0]);
            setPreview(URL.createObjectURL(e.target.files[0]));
          }}
          className="border p-2 rounded w-full"
        />

        {preview && (
          <div className="mt-2">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-contain border rounded"
            />
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full"
        >
          ✅ Update Product
        </button>
      </form>
    </div>
  );
};

export default AdminEditProductPage;
