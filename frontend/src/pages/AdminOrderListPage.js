import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Papa from "papaparse";

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `https://ecommerce-clothing-lwhf.onrender.com/api/admin/orders?page=${page}&search=${search}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOrders(data.orders);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Order fetch error:", err);
      toast.error("❌ Failed to fetch orders");
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://ecommerce-clothing-lwhf.onrender.com/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("✅ Order status updated");
      fetchOrders();
    } catch (err) {
      toast.error("❌ Failed to update status");
    }
  };

  const handleCSVExport = () => {
    const csv = Papa.unparse(
      orders.map((order) => ({
        ID: order._id,
        Name: order.user?.name || "N/A",
        Email: order.user?.email || "N/A",
        Total: order.total,
        Status: order.status,
        Date: new Date(order.createdAt).toLocaleString(),
      }))
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "orders.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredOrders =
    filterStatus === "All"
      ? orders
      : orders.filter((order) => order.status === filterStatus);

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h2 className="text-3xl font-bold mb-6 text-purple-700">📦 Admin - All Orders</h2>

      {/* 🔍 Filter & Export Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <label className="font-semibold text-gray-700">Filter by Status:</label>
          <select
            className="border px-2 py-1 rounded"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="🔍 Search by user or order ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded w-full md:w-72"
        />

        <button
          onClick={handleCSVExport}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          ⬇️ Export CSV
        </button>
      </div>

      {/* 🧾 Orders List */}
      {filteredOrders.length === 0 ? (
        <p className="text-gray-500 text-center">
          No orders found for this status or search.
        </p>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="border p-5 rounded shadow-md bg-white hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg">
                  🧾 Order #{order._id.slice(-6)}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>

              <p className="text-gray-700 mb-1">
                <strong>User:</strong> {order.user?.name} ({order.user?.email})
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Total:</strong> ₹{order.total}
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Status:</strong>{" "}
                <select
                  value={order.status}
                  onChange={(e) =>
                    handleStatusChange(order._id, e.target.value)
                  }
                  className="border rounded px-2 py-1"
                >
                  {["Processing", "Shipped", "Delivered", "Cancelled"].map(
                    (status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    )
                  )}
                </select>
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Shipping:</strong> {order.address}
              </p>

              {order.designImage && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Uploaded Design:</p>
                  <img
                    src={order.designImage}
                    alt="Design"
                    className="w-40 h-40 object-contain border rounded"
                  />
                </div>
              )}

              <div className="mt-3">
                <strong>Items:</strong>
                <ul className="list-disc ml-5 text-gray-600">
                  {order.items.map((item, i) => (
                    <li key={i}>
                      {item.product?.name || "Deleted Product"} ×{" "}
                      {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ⏭️ Pagination Controls */}
      <div className="flex justify-center mt-8 gap-4 items-center">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          ◀️ Prev
        </button>
        <span className="text-sm font-medium">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          Next ▶️
        </button>
      </div>
    </div>
  );
};

export default AdminOrdersPage;
