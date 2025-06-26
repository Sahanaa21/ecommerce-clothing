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

dotenv.config();

const app = express();

// ✅ __dirname fix for ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Stripe Webhook route requires raw body - mount BEFORE express.json
app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentRoutes
);

// ✅ Core Middlewares
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // normal JSON for other routes

// ✅ Static file serving for uploads
app.use("/api/upload", uploadRoutes);

// ✅ Main API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes); // mounts: /create-checkout-session

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
