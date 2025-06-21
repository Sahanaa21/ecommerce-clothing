import User from "../models/User.js";
import Product from "../models/Product.js";
import jwt from "jsonwebtoken";

/* 🔐 Helper: Generate JWT */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

/* ========== 📝 Register ========== */
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = await User.create({ name, email, password });

    const token = generateToken(newUser._id);
    res.status(201).json({
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error("🔥 Registration error:", err.message);
    res.status(500).json({ message: "Failed to register user" });
  }
};

/* ========== 🔐 Login ========== */
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      token,
      user: { name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("🔥 Login error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/* ========== 👤 Profile ========== */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("wishlist", "name price image");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("🔥 getProfile error:", err.message);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.file) {
      user.profileImage = `/uploads/profile/${req.file.filename}`;
    }

    await user.save();
    res.json({ message: "Profile updated", user });
  } catch (err) {
    console.error("🔥 Profile update error:", err.message);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

/* ========== ❤️ Wishlist ========== */
export const toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.productId;

    if (!user) return res.status(404).json({ message: "User not found" });

    const alreadyInWishlist = user.wishlist.includes(productId);

    if (alreadyInWishlist) {
      user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
      await user.save();
      return res.json({ message: "Removed from wishlist" });
    } else {
      user.wishlist.push(productId);
      await user.save();
      return res.json({ message: "Added to wishlist" });
    }
  } catch (err) {
    console.error("🔥 Wishlist toggle error:", err.message);
    res.status(500).json({ message: "Failed to update wishlist" });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.wishlist);
  } catch (err) {
    console.error("🔥 Get wishlist error:", err.message);
    res.status(500).json({ message: "Failed to fetch wishlist" });
  }
};

/* ========== 🏠 Address ========== */
export const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.addresses || []);
  } catch (err) {
    console.error("🔥 Get addresses error:", err.message);
    res.status(500).json({ message: "Failed to fetch addresses" });
  }
};

export const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.push(req.body);
    await user.save();

    res.status(201).json({ message: "Address added", addresses: user.addresses });
  } catch (err) {
    console.error("🔥 Add address error:", err.message);
    res.status(500).json({ message: "Failed to add address" });
  }
};

export const updateAddress = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(req.user._id);
    const index = user.addresses.findIndex((addr) => addr._id.toString() === id);
    if (index === -1) return res.status(404).json({ message: "Address not found" });

    user.addresses[index] = { ...user.addresses[index]._doc, ...req.body };
    await user.save();

    res.json({ message: "Address updated", addresses: user.addresses });
  } catch (err) {
    console.error("🔥 Update address error:", err.message);
    res.status(500).json({ message: "Failed to update address" });
  }
};

export const deleteAddress = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter((addr) => addr._id.toString() !== id);
    await user.save();

    res.json({ message: "Address deleted", addresses: user.addresses });
  } catch (err) {
    console.error("🔥 Delete address error:", err.message);
    res.status(500).json({ message: "Failed to delete address" });
  }
};
