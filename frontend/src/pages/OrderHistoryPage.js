import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axios";
import { toast } from "react-toastify";

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axiosInstance.get("/orders/my-orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(data);
      } catch (err) {
        toast.error("❌ Failed to load order history");
      }
    };

    fetchOrders();
  }, []);

  const downloadInvoice = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get(`/orders/${orderId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice-${orderId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Invoice download failed", err);
      toast.error("❌ Failed to download invoice");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-blue-700 mb-6">📦 Order History</h2>

      {orders.length === 0 ? (
        <p className="text-center text-gray-600">No past orders found.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="border rounded-lg p-4 shadow-md bg-white">
              <div className="mb-2 text-sm text-gray-500">🆔 Order ID: {order._id}</div>
              <div className="text-sm text-gray-500">
                🗓️ Placed: {new Date(order.createdAt).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">
                🚚 Expected Delivery:{" "}
                <strong className="text-green-700">
                  {new Date(order.expectedDelivery).toDateString()}
                </strong>
              </div>

              <div className="font-semibold mt-2 mb-1 text-green-700">📍 Shipping Address:</div>
              <p className="text-gray-700 mb-2">{order.address}</p>

              {/* 🛍️ Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
               {order.items.map((item, idx) => {
  const baseImage =
    item.product?.baseImage || item.baseImage || "/images/no-image.jpg";

  const imageSrc = baseImage.startsWith("http")
    ? baseImage
    : `https://ecommerce-clothing-lwhf.onrender.com${baseImage}`;

  return (
    <div key={idx} className="flex items-center border rounded p-2 bg-gray-50">
      <img
        src={imageSrc}
        alt={item.name || item.product?.name || "Product"}
        className="w-16 h-16 object-cover mr-4 rounded"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "/images/no-image.jpg";
        }}
      />
      <div>
        <p className="font-semibold">
          {item.name || item.product?.name || "Product Deleted"}
        </p>
        <p className="text-sm text-gray-600">
          ₹{item.variant?.price?.toFixed(2) || "0.00"} × {item.quantity}
        </p>
        <p className="text-xs text-gray-500">
          {item.variant?.size || "Size N/A"} | {item.variant?.color || "Color N/A"}
        </p>
      </div>
    </div>
  );
})}

              </div>

              {/* 🎨 Design image */}
              {order.designImage && order.designImage.startsWith("http") && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-1 font-medium">🎨 Uploaded Design:</p>
                  <img
                    src={order.designImage}
                    alt="Uploaded Design"
                    className="w-40 h-40 object-contain border rounded"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/no-image.jpg";
                    }}
                  />
                </div>
              )}

              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-600">
                  Status:{" "}
                  <span className="font-medium text-blue-700">{order.status}</span>
                </div>

                <button
                  onClick={() => downloadInvoice(order._id)}
                  className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 text-sm"
                >
                  📄 Download Invoice
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
