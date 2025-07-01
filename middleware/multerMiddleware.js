// ✅ Upload product with image (file) + variants (JSON)
export const uploadProduct = async (req, res) => {
  try {
    const { name, description, category, variants } = req.body;
    const baseImageFile = req.file;

    if (!name || !category || !description || !variants || !baseImageFile) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Upload image file to Cloudinary
    const uploadRes = await cloudinary.uploader.upload(baseImageFile.path, {
      folder: "ecommerce-products",
    });

    const baseImageUrl = uploadRes.secure_url;

    // Parse variants JSON
    const parsedVariants =
      typeof variants === "string" ? JSON.parse(variants) : variants;

    if (!Array.isArray(parsedVariants) || parsedVariants.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one variant is required" });
    }

    const finalVariants = parsedVariants.map((variant) => ({
      size: variant.size,
      color: variant.color,
      type: variant.type || "Default",
      price: Number(variant.price),
      stock: Number(variant.stock),
      image: variant.image || baseImageUrl, // Optional variant-level image
    }));

    const newProduct = new Product({
      name,
      description,
      category,
      baseImage: baseImageUrl,
      variants: finalVariants,
    });

    await newProduct.save();
    res.status(201).json({ message: "✅ Product uploaded", product: newProduct });
  } catch (error) {
    console.error("❌ Product upload error:", error.message);
    res.status(500).json({ message: "Failed to upload product", error: error.message });
  }
};
