import cloudinary from "../config/cloudinary.js";
import multer from "multer";
import fs from "fs";

// Setup multer for file uploads (temporary local)
const upload = multer({ dest: "uploads/" });

// ✅ Upload design file to Cloudinary
export const uploadDesign = async (req, res) => {
  try {
    const filePath = req.file.path;

    const result = await cloudinary.uploader.upload(filePath, {
      folder: "design-uploads",
    });

    fs.unlinkSync(filePath); // clean up temp file

    res.json({ url: result.secure_url });
  } catch (err) {
    console.error("❌ Design Upload Error:", err);
    res.status(500).json({ message: "Design upload failed" });
  }
};

export default upload;
