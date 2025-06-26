 import cloudinary from "../config/cloudinary.js";

// ✅ Upload product image to Cloudinary
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
