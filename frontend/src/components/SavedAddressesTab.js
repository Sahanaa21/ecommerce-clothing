import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import { toast } from "react-toastify";
import AddressForm from "./AddressForm";

const SavedAddressesTab = () => {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const token = localStorage.getItem("token");

  // ✅ Fetch all saved addresses for the user
  const fetchAddresses = async () => {
    if (!token) return;
    try {
      const res = await axiosInstance.get("/users/addresses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses(res.data || []);
    } catch (err) {
      console.error("Fetch addresses error:", err);
      toast.error("❌ Failed to load addresses");
    }
  };

  useEffect(() => {
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Delete address
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await axiosInstance.delete(`/users/addresses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("🗑️ Address deleted");
      fetchAddresses();
    } catch (err) {
      toast.error("❌ Failed to delete address");
    }
  };

  // ✅ When form submits successfully (add/edit)
  const handleFormSuccess = () => {
    fetchAddresses();
    setShowForm(false);
    setEditingAddress(null);
  };

  // ✅ Edit address handler
  const handleEdit = (addr) => {
    setEditingAddress(addr);
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      {/* 🔘 Top heading */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">📍 Saved Addresses</h3>
        <button
          onClick={() => {
            setEditingAddress(null);
            setShowForm(true);
          }}
          className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
        >
          ➕ Add New
        </button>
      </div>

      {/* 📝 Address Form */}
      {showForm && (
        <AddressForm
          initialData={editingAddress}
          onCancel={() => {
            setShowForm(false);
            setEditingAddress(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* 📦 List of addresses */}
      {addresses.length === 0 ? (
        <p className="text-gray-500">No addresses saved.</p>
      ) : (
        addresses.map((addr) => (
          <div
            key={addr._id}
            className="border p-4 rounded bg-gray-50 shadow-sm"
          >
            <p>
              <strong>{addr.fullName}</strong> | 📞 {addr.phone}
            </p>
            <p>
              {addr.houseNumber}, {addr.area},{" "}
              {addr.landmark && `${addr.landmark}, `}
              {addr.city}, {addr.state} - {addr.pincode}
            </p>

            <div className="mt-2 flex gap-3">
              <button
                onClick={() => handleEdit(addr)}
                className="text-blue-600 underline text-sm"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => handleDelete(addr._id)}
                className="text-red-600 underline text-sm"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SavedAddressesTab;
