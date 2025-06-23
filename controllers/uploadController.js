import fs from 'fs';
import path from 'path';

// Ensure the /uploads folder exists
const uploadDir = path.join(path.resolve(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ ESM export for use in routes
export const uploadImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.status(201).json({
      message: "✅ Image uploaded successfully",
      imageUrl,
    });
  } catch (error) {
    console.error("Image Upload Error:", error);
    res.status(500).json({ message: "❌ Error uploading image" });
  }
};
