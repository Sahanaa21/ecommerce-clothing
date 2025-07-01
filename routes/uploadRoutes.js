import express from "express";
import multer from "multer";
import { uploadImage, uploadDesign } from "../controllers/uploadController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Setup multer for design uploads (temporary local storage)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Safer and consistent with Cloudinary cleanup
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split(".").pop();
    cb(null, `${Date.now()}.${ext}`);
  },
});

const upload = multer({ storage });

// ✅ Admin: Upload product image (base64)
router.post("/product", verifyToken, uploadImage);

// ✅ User: Upload design image (file)
router.post("/design", verifyToken, upload.single("design"), uploadDesign);

export default router;
