import cloudinary from "../config/cloudinary.js";
import multer from "multer";
import fs from "fs";

// ✅ Set up multer for handling multipart/form-data uploads (for design uploads)
const upload = multer({ dest: "uploads/" }); // temp folder

// ✅ Upload product image (admin panel - base64 string)
export const uploadImage = async (req, res) => {
  try {
    const fileStr = req.body.image; // base64 string from admin panel

    if (!fileStr) {
      return res.status(400).json({ message: "No image data provided" });
    }

    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      folder: "ecommerce-products",
    });

    res.json({ imageUrl: uploadResponse.secure_url });
  } catch (err) {
    console.error("❌ Cloudinary Upload Error:", err);
    res.status(500).json({ message: "Image upload failed" });
  }
};

// ✅ Upload design image (checkout design upload)
export const uploadDesign = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "ecommerce-designs",
    });

    // Optional: remove temp file after upload
    fs.unlinkSync(req.file.path);

    res.status(200).json({ url: result.secure_url }); // matches frontend expectation: setDesignURL(res.data.url)
  } catch (err) {
    console.error("❌ Design upload error:", err);
    res.status(500).json({ message: "Design upload failed" });
  }
};

export default upload;
