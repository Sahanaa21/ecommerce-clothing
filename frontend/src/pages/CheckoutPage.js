import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import axiosInstance from "../utils/axios";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_test_51RcYnIFNlpwciaHdUVa5BLXz6GDXUMSsRCbWrWEPtpm2Q0j25QeVFLe8MrAcUlT42t9CX6PIjfKmex2BfVCzm3I600QqfAE9SM");
const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dqkul6sto/image/upload";
const CLOUDINARY_PRESET = "ecommerce_uploads"; 
const CheckoutPage = () => {
  const { cartItems } = useCart();
  const token = localStorage.getItem("token");

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [loading, setLoading] = useState(true);
  const [designFile, setDesignFile] = useState(null);
  const [designURL, setDesignURL] = useState("");
  const [stockWarnings, setStockWarnings] = useState([]);

  const [customAddress, setCustomAddress] = useState({
    fullName: "",
    phone: "",
    houseNumber: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!token) return;
      try {
        const res = await axiosInstance.get("/users/addresses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAddresses(res.data || []);
      } catch (err) {
        console.error("Error fetching addresses:", err.response?.data || err.message);
        toast.error("❌ Failed to load saved addresses.");
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, [token]);

  useEffect(() => {
    const warnings = cartItems
      .filter((item) => item.quantity > (item.variant?.stock || 0))
      .map((item) =>
        `${item.name} (${item.variant?.size || "Size"}/${item.variant?.color || "Color"}) — Available: ${item.variant?.stock || 0}, In Cart: ${item.quantity}`
      );
    setStockWarnings(warnings);
  }, [cartItems]);

  const getTotalPrice = () =>
    cartItems.reduce(
      (total, item) =>
        total + (item.variant?.price || item.price || 0) * item.quantity,
      0
    );

  const formatAddress = (addr) =>
    `${addr.fullName}, ${addr.houseNumber}, ${addr.area}, ${addr.landmark ? addr.landmark + ", " : ""}${addr.city}, ${addr.state} - ${addr.pincode}. Phone: ${addr.phone}`;

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_PRESET);

    try {
      const res = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      return data.secure_url;
    } catch (err) {
      console.error("Cloudinary Upload Error:", err);
      toast.error("❌ Failed to upload design to Cloudinary.");
      return "";
    }
  };

  const handleDesignUpload = async () => {
    if (!designFile) return;
    toast.info("⏳ Uploading design...");
    const url = await uploadToCloudinary(designFile);
    if (url) {
      setDesignURL(url);
      toast.success("✅ Design uploaded!");
    }
  };

  const handlePlaceOrder = async () => {
    if (stockWarnings.length > 0) {
      toast.error("⚠️ Please fix stock issues before placing order.");
      return;
    }

    let addressToUse = "";

    if (useNewAddress) {
      const {
        fullName, phone, houseNumber, area, city, state, pincode,
      } = customAddress;

      if (!fullName || !phone || !houseNumber || !area || !city || !state || !pincode) {
        return toast.error("⚠️ Please fill in all required fields.");
      }

      try {
        await axiosInstance.post("/users/addresses", customAddress, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error("Save address failed:", err.message);
        return toast.error("❌ Failed to save new address.");
      }

      addressToUse = formatAddress(customAddress);
    } else {
      const selected = addresses.find((a) => a._id === selectedAddressId);
      if (!selected) return toast.error("⚠️ Please select a shipping address.");
      addressToUse = formatAddress(selected);
    }

    const orderPayload = {
      items: cartItems.map((item) => ({
        _id: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.variant?.price || item.price || 0,
        variant: {
          size: item.variant?.size,
          color: item.variant?.color,
        },
      })),
      address: addressToUse,
      designImage: designURL || "",
    };

    try {
      const { data } = await axiosInstance.post(
        "/payments/create-checkout-session",
        orderPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const stripe = await stripePromise;
      const result = await stripe.redirectToCheckout({ sessionId: data.id });

      if (result.error) {
        console.error("Stripe error:", result.error.message);
        toast.error("❌ Stripe checkout failed.");
      }
    } catch (err) {
      console.error("Order failed:", err.message);
      toast.error("❌ Failed to create Stripe session.");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading saved addresses...</p>;

  

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-lg mt-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">🧾 Checkout</h2>

      {stockWarnings.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-6">
          <strong>⚠️ Some items exceed available stock:</strong>
          <ul className="list-disc pl-6 mt-2">
            {stockWarnings.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 🚚 Address Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Select Shipping Address:</h3>

        {!useNewAddress && (
          <div className="space-y-3 mb-4">
            {addresses.length === 0 ? (
              <p className="text-sm text-gray-500">No saved addresses. Use new address below 👇</p>
            ) : (
              addresses.map((addr) => (
                <label
                  key={addr._id}
                  className="block border p-3 rounded cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="selectedAddress"
                    className="mr-2"
                    checked={selectedAddressId === addr._id}
                    onChange={() => setSelectedAddressId(addr._id)}
                  />
                  {formatAddress(addr)}
                </label>
              ))
            )}
          </div>
        )}

        <div className="flex items-center gap-3 mb-2">
          <input
            type="checkbox"
            checked={useNewAddress}
            onChange={() => {
              setUseNewAddress(!useNewAddress);
              setSelectedAddressId("");
            }}
          />
          <span>Enter a new address instead</span>
        </div>

        {useNewAddress && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "fullName", label: "Full Name" },
              { name: "phone", label: "Phone Number" },
              { name: "houseNumber", label: "House Number" },
              { name: "area", label: "Area / Street" },
              { name: "landmark", label: "Landmark (optional)" },
              { name: "city", label: "City" },
              { name: "state", label: "State" },
              { name: "pincode", label: "Pincode" },
            ].map(({ name, label }) => (
              <input
                key={name}
                name={name}
                placeholder={label}
                value={customAddress[name]}
                onChange={(e) =>
                  setCustomAddress({ ...customAddress, [name]: e.target.value })
                }
                className="border p-2 rounded w-full"
                required={name !== "landmark"}
              />
            ))}
          </div>
        )}
      </div>

      {/* 🎨 Design Upload */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Upload Your Design (optional):</h3>
        <input
          type="file"
          accept="image/png, image/jpeg"
          onChange={(e) => setDesignFile(e.target.files[0])}
          className="mb-2"
        />
        <button
          onClick={handleDesignUpload}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
        >
          📤 Upload Design
        </button>
        {designURL && (
          <div className="mt-4">
            <p className="text-sm text-green-700">Design uploaded:</p>
            <img
              src={designURL}
              alt="Design Preview"
              className="w-40 h-40 object-contain border mt-2"
            />
          </div>
        )}
      </div>

      {/* 🛒 Cart Summary */}
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-2">Cart Summary:</h3>
        <ul className="list-disc list-inside text-gray-700">
          {cartItems.map((item) => {
            const price = item.variant?.price || item.price || 0;
            return (
              <li key={item.key}>
                {item.name} ({item.variant?.size || "Free Size"}/
                {item.variant?.color || "Standard"}) x {item.quantity} = ₹
                {(price * item.quantity).toFixed(2)}
              </li>
            );
          })}
        </ul>
        <p className="mt-3 font-bold text-green-700 text-xl">
          Total: ₹{getTotalPrice().toFixed(2)}
        </p>
      </div>

      <button
        onClick={handlePlaceOrder}
        className={`px-6 py-2 rounded transition text-white ${stockWarnings.length > 0
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-green-600 hover:bg-green-700"
          }`}
        disabled={stockWarnings.length > 0}
      >
        ✅ Place Order
      </button>
    </div>
  );
};

export default CheckoutPage;
