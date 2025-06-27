import express from "express";
import multer from "multer";
import cloudinary from "cloudinary";
import fs from "fs";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/design", upload.single("designImage"), async (req, res) => {
  try {
    const result = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: "designs",
    });

    fs.unlinkSync(req.file.path); // delete temp file

    res.status(200).json({ url: result.secure_url });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    res.status(500).json({ message: "Failed to upload image" });
  }
});

export default router;
