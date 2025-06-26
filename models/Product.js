import mongoose from "mongoose";

// 🎨 Subschema for product variants
const variantSchema = new mongoose.Schema(
  {
    size: { type: String, required: true },       // e.g., S, M, L, XL
    color: { type: String, required: true },      // e.g., Black, White
    type: { type: String, default: "Default" },   // Default for now, customizable later
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    image: { type: String, default: "" },         // Optional variant image (else fallback to baseImage)
  },
  { _id: false }
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
      required: true, // URL from Cloudinary
    },
    price: {
      type: Number,
      default: 0, // Initial fallback (but auto-filled from variant)
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

// ✅ Auto-populate top-level price from first variant if not given
productSchema.pre("save", function (next) {
  if (!this.price && this.variants?.length > 0) {
    this.price = this.variants[0].price;
  }
  next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;
