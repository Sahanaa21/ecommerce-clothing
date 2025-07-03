import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: String,
    baseImage: String,
    price: Number,
    quantity: Number,
    variant: {
      size: String,
      color: String,
    },
  },
],

    
    total: { type: Number, required: true },
    address: { type: String, required: true },
    designImage: { type: String }, // ✅ Cloudinary design URL (optional)
    status: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",
    },
    expectedDelivery: {
      type: Date, // ✅ NEW FIELD: Expected delivery date
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
