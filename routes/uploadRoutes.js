import express from "express";
import multer from "multer";
import path from "path";
import { uploadImage } from "../controllers/uploadController.js";

const router = express.Router();

// Multer Storage Config
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); // Save in /uploads
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// POST /api/upload (Single Image)
router.post('/', upload.single('image'), uploadImage);

export default router;
