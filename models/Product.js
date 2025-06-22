import mongoose from "mongoose";

// 🎨 Subschema for product variants
const variantSchema = new mongoose.Schema(
  {
    size: { type: String, required: true },       // e.g., S, M, L, XL
    color: { type: String, required: true },      // e.g., Black, White
    type: { type: String, required: true },       // e.g., T-shirt, Hoodie
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    image: { type: String, default: "" },         // Optional custom image for variant
  },
  { _id: false } // prevents automatic _id for subdocs
);

// 🛍️ Main Product Schema
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: true,
      enum: ["Men", "Women", "Kids"],
    },
    baseImage: {
      type: String,
      required: true, // base preview image
    },
    variants: {
      type: [variantSchema],
      validate: {
        validator: (val) => Array.isArray(val) && val.length > 0,
        message: "At least one variant is required",
      },
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
