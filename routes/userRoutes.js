import express from "express";
import multer from "multer";
import { verifyToken } from "../middleware/authMiddleware.js";
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

// ➕ Register user (uses controller)
router.post("/register", registerUser);

// 🔐 Login
router.post("/login", loginUser);

/* ===========================
    👤 Profile Routes
=========================== */

// 📄 Get profile
router.get("/profile", verifyToken, getProfile);

// ✏️ Update profile (with image)
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

export default router;
