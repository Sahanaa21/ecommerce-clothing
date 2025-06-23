import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { uploadImage } from "../controllers/uploadController.js";

const router = express.Router();

// Ensure 'uploads' folder exists
const ensureFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};
ensureFolder("uploads");
ensureFolder("uploads/designs");

// Multer Storage Config for generic product images
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${Date.now()}${ext}`);
  },
});

const designStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/designs/');
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `design-${name}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });
const designUpload = multer({ storage: designStorage });

// 🖼️ For product images: /api/upload (field: image)
router.post('/', upload.single('image'), uploadImage);

// 🎨 For design uploads: /api/upload/design (field: designImage)
router.post('/design', designUpload.single('designImage'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No design file uploaded." });
  }
  res.status(200).json({ url: `/uploads/designs/${req.file.filename}` });
});

export default router;
