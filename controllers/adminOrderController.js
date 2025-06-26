import Order from "../models/Order.js";
import generateInvoice from "../utils/generateInvoice.js";

export const getInvoiceByOrderId = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user").populate("items.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // You can restrict only admin or order-owner here
    generateInvoice(order, res);
  } catch (err) {
    console.error("Invoice generation failed:", err);
    res.status(500).json({ message: "Failed to generate invoice" });
  }
};
