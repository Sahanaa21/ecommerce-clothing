import React, { useState } from "react";
import axios from "../utils/axios";
import { toast } from "react-toastify";

const AdminUploadPage = () => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    baseImage: "",
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [variants, setVariants] = useState([
    { size: "", color: "", price: "", stock: "" },
  ]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ecommerce_uploads");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dqkul6sto/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      setForm((prev) => ({ ...prev, baseImage: data.secure_url }));
      toast.success("✅ Image uploaded to Cloudinary");
    } catch (err) {
      console.error("Cloudinary Upload Error:", err);
      toast.error("❌ Image upload failed");
    }
  };

  const handleVariantChange = (index, e) => {
    const { name, value } = e.target;
    setVariants((prev) => {
      const updated = [...prev];
      updated[index][name] = value;
      return updated;
    });
  };

  const addVariant = () => {
    setVariants((prev) => [...prev, { size: "", color: "", price: "", stock: "" }]);
  };

  const removeVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.baseImage) return toast.error("📷 Please upload an image");

    if (!form.name || !form.description || !form.category || variants.length === 0) {
      return toast.error("🚫 Please fill in all fields and at least one variant");
    }

    const finalVariants = variants.map((v) => ({
      size: v.size || "Free Size",
      color: v.color || "Standard",
      price: Number(v.price),
      stock: Number(v.stock),
      image: form.baseImage,
    }));

    try {
      const token = localStorage.getItem("token");

      const payload = {
        name: form.name,
        description: form.description,
        category: form.category,
        baseImage: form.baseImage,
        variants: finalVariants,
      };

      await axios.post("/admin/products", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("✅ Product uploaded!");

      // Reset form
      setForm({ name: "", description: "", category: "", baseImage: "" });
      setVariants([{ size: "", color: "", price: "", stock: "" }]);
      setImagePreview(null);
    } catch (err) {
      console.error("Upload Failed:", err.response?.data || err.message);
      toast.error("❌ Upload failed: " + (err.response?.data?.message || "Unknown error"));
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
        🛠️ Upload Product
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleFormChange}
          className="w-full border px-4 py-2 rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleFormChange}
          className="w-full border px-4 py-2 rounded"
          required
        />
        <select
          name="category"
          value={form.category}
          onChange={handleFormChange}
          className="w-full border px-4 py-2 rounded"
          required
        >
          <option value="">Select Category</option>
          <option value="Men">Men</option>
          <option value="Women">Women</option>
          <option value="Kids">Kids</option>
        </select>

        {/* 📦 Variants */}
        <div>
          <h3 className="font-semibold text-lg mb-2">Variants:</h3>
          {variants.map((variant, index) => (
            <div key={index} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
              <select
                name="size"
                value={variant.size}
                onChange={(e) => handleVariantChange(index, e)}
                className="border p-2 rounded"
                required
              >
                <option value="">Select Size</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
                <option value="Free Size">Free Size</option>
              </select>

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

        {/* 📷 Image Upload */}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full border px-4 py-2 rounded"
          required
        />
        {imagePreview && (
          <div className="mt-2">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-40 w-full object-contain border"
            />
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition w-full"
        >
          🚀 Upload Product
        </button>
      </form>
    </div>
  );
};

export default AdminUploadPage;
