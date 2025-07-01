import express from "express";
import multer from "multer";
import { uploadImage, uploadDesign } from "../controllers/uploadController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ multer disk storage (temp use before uploading to Cloudinary)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/designs/"); // temp folder (make sure this exists or handle missing folder)
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split(".").pop();
    cb(null, `${Date.now()}.${ext}`);
  },
});

const upload = multer({ storage });

// ✅ Admin image upload via base64
router.post("/product", verifyToken, uploadImage);

router.post("/design", upload.single("design"), uploadDesign);


export default router;
