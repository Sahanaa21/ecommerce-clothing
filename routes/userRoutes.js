import express from "express";
import multer from "multer";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import {verifyToken }from "../middleware/authMiddleware.js";
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getWishlist,
  toggleWishlist,
} from "../controllers/userController.js";

const router = express.Router();

/* ===========================
   📸 Multer Config (Profile)
=========================== */
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/profile");
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

/* ===========================
    🔐 Auth Routes
=========================== */

// ➕ Register user
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed });
    await user.save();
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
});

// 🔐 Login
router.post("/login", loginUser);

/* ===========================
    👤 Profile Routes
=========================== */

// 📄 Get profile
router.get("/profile", verifyToken, getProfile);

// ✏️ Update profile
router.patch("/profile", verifyToken, upload.single("image"), updateProfile);

/* ===========================
    🏠 Address Routes
=========================== */

// 📦 Get addresses
router.get("/addresses", verifyToken, getAddresses);

// ➕ Add address
router.post("/addresses", verifyToken, addAddress);

// ✏️ Update address
router.put("/addresses/:id", verifyToken, updateAddress);

// ❌ Delete address
router.delete("/addresses/:id", verifyToken, deleteAddress);

/* ===========================
    ❤️ Wishlist Routes
=========================== */

// 📋 Get wishlist
router.get("/wishlist", verifyToken, getWishlist);

// 🔁 Add/Remove product to/from wishlist
router.post("/wishlist/:productId", verifyToken, toggleWishlist);
// 🧪 Temporary registration route (for testing)
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("❌ Registration failed:", err.message);
    res.status(500).json({ message: "Registration failed" });
  }
});


export default router;
