// server.js
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// ✅ Route imports
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { handleStripeWebhook } from "./controllers/paymentController.js"; // ✅ webhook handler

dotenv.config();

const app = express();

// ✅ Fix __dirname for ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Stripe Webhook (raw body) - must be before express.json()
app.post(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

// ✅ Core Middlewares
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // must come after webhook

// ✅ Static file serving for uploads
app.use("/upload", uploadRoutes);
app.use("/uploads", express.static(path.join(__dirname, "/uploads"))); // image access
app.use("/images", express.static("public/images"));

// ✅ Main API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes); // for /create-checkout-session etc.

// ✅ Health Check
app.get("/", (req, res) => {
  res.send("🛒 E-Commerce API Running...");
});

// ✅ Connect MongoDB + Start Server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
  });
