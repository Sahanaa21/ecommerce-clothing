import mongoose from "mongoose";  
import bcrypt from "bcryptjs";

// 📦 Embedded Address Schema
const addressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    houseNumber: { type: String, required: true },
    area: { type: String, required: true },
    landmark: { type: String, default: "" }, // Optional
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  { timestamps: true }
);

// 👤 Main User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false }, // ✅ For admin access
  profileImage: { type: String, default: "" },
  addresses: [addressSchema], // 🏠 Embedded address list
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], // ❤️ Wishlist
});
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
