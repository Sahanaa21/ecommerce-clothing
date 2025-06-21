// server.js
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// ✅ Route imports
import authRoutes from "./routes/authRoutes.js";         // /api/auth/login, /register
import userRoutes from "./routes/userRoutes.js";         // /api/users/profile, /addresses
import productRoutes from "./routes/productRoutes.js";   // /api/products
import orderRoutes from "./routes/orderRoutes.js";       // /api/orders
import uploadRoutes from "./routes/uploadRoutes.js";     // /api/upload
import adminRoutes from "./routes/adminRoutes.js";       // /api/admin
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config(); // Load .env variables

const app = express();

// ✅ __dirname workaround for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Middlewares
app.use(cors());
app.use(express.json()); // Handle JSON body
app.use(express.urlencoded({ extended: true })); // Handle form submissions

// ✅ Static file serving for uploaded images
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// ✅ Mount routes with base paths
app.use("/api/auth", authRoutes);         // Login, Register
app.use("/api/users", userRoutes);        // Profile, Address, Wishlist
app.use("/api/products", productRoutes);  // Products
app.use("/api/orders", orderRoutes);      // Orders
app.use("/api/upload", uploadRoutes);     // Product image upload
app.use("/api/admin", adminRoutes);       // Admin dashboard APIs
app.use("/api/payments", paymentRoutes);

// ✅ Base route for sanity check
app.get("/", (req, res) => {
  res.send("🛒 E-Commerce API Running...");
});

// ✅ Connect to MongoDB & start server
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));
