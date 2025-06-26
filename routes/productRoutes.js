import express from "express";
import {
  uploadProduct,
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Route for uploading product from AdminUploadPage (with baseImage URL)
router.post("/upload", verifyAdmin, uploadProduct);

// Other product routes
router.post("/", verifyAdmin, createProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.put("/:id", verifyAdmin, updateProduct);
router.delete("/:id", verifyAdmin, deleteProduct);

export default router;
