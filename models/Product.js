import mongoose from "mongoose";

// 🎨 Subschema for product variants
const variantSchema = new mongoose.Schema(
  {
    size: { type: String, required: true },       // e.g., S, M, L, XL
    color: { type: String, required: true },      // e.g., Black, White, Blue
    type: { type: String, required: true },       // e.g., T-shirt, Hoodie
    price: { type: Number, required: true },      // price per variant
    stock: { type: Number, default: 0 },          // available quantity
    image: { type: String },                      // optional custom image (e.g., colored mockup)
  },
  { _id: false }
);

// 🛍️ Main Product Schema
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    category: {
      type: String,
      required: true,
      enum: ["Men", "Women", "Kids"],
    },
    baseImage: {
      type: String, // used for main product preview
      required: true,
    },
    variants: [variantSchema], // 🧩 array of variant options
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
