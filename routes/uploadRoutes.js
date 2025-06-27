import express from "express";
import upload, { uploadDesign } from "../controllers/uploadController.js";

const router = express.Router();

// 🔹 Endpoint to upload design
router.post("/design", upload.single("designImage"), uploadDesign);

export default router;
