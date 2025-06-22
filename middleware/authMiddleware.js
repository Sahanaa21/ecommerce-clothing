import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ✅ Middleware to verify JWT and attach user to request
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password"); // 🔧 FIXED FIELD

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("🔐 JWT verification error:", err);
    res.status(401).json({ message: "Invalid token" });
  }
};

// ✅ Admin check middleware
const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(403).json({ message: "Admin access denied" });
  }
};

export { verifyToken, verifyAdmin };
