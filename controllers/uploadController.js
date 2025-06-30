import cloudinary from "../config/cloudinary.js";
import multer from "multer";
import fs from "fs";

// Setup multer for file uploads (temporary local)
const upload = multer({ dest: "uploads/" });

// ✅ Upload product image (used in admin product upload)
export const uploadImage = async (req, res) => {
  try {
    const fileStr = req.body.image; // base64 string
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      folder: "ecommerce-products",
    });

    res.json({ imageUrl: uploadResponse.secure_url });
  } catch (err) {
    console.error("❌ Cloudinary Upload Error:", err);
    res.status(500).json({ message: "Image upload failed" });
  }
};

// ✅ Upload design image (used in user checkout)
export const uploadDesign = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "ecommerce-designs",
    });

    res.status(200).json({ designImageUrl: result.secure_url });
  } catch (err) {
    console.error("❌ Design upload error:", err);
    res.status(500).json({ message: "Design upload failed" });
  }
};
export default upload;
