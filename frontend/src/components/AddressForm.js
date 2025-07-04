import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import { toast } from "react-toastify";

const AddressForm = ({ initialData = null, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    houseNumber: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  });

  const token = localStorage.getItem("token");

  // 🧠 Pre-fill form if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName || "",
        phone: initialData.phone || "",
        houseNumber: initialData.houseNumber || "",
        area: initialData.area || "",
        landmark: initialData.landmark || "",
        city: initialData.city || "",
        state: initialData.state || "",
        pincode: initialData.pincode || "",
      });
    }
  }, [initialData]);

  // 📝 Form change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 💾 Save or Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = initialData
      ? `/users/addresses/${initialData._id}`
      : "/users/addresses";
    const method = initialData ? "put" : "post";

    try {
      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(`✅ Address ${initialData ? "updated" : "added"}!`);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Address submit error:", err);
      toast.error("❌ Failed to save address");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border rounded-lg shadow p-6 space-y-4"
    >
      <h3 className="text-lg font-bold text-gray-700">
        {initialData ? "✏️ Edit Address" : "➕ Add New Address"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { name: "fullName", placeholder: "Full Name", required: true },
          { name: "phone", placeholder: "Phone Number", required: true },
          { name: "houseNumber", placeholder: "House Number", required: true },
          { name: "area", placeholder: "Area / Street", required: true },
          { name: "landmark", placeholder: "Landmark (optional)", required: false },
          { name: "city", placeholder: "City", required: true },
          { name: "state", placeholder: "State", required: true },
          { name: "pincode", placeholder: "Pincode", required: true },
        ].map(({ name, placeholder, required }) => (
          <input
            key={name}
            type="text"
            name={name}
            placeholder={placeholder}
            value={formData[name]}
            onChange={handleChange}
            required={required}
            className="border rounded p-2 w-full"
          />
        ))}
      </div>

      <div className="flex gap-4 mt-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
        >
          {initialData ? "Update" : "Save"} Address
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 text-gray-800 px-5 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default AddressForm;
