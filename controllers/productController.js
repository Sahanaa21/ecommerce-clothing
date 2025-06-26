// controllers/productController.js
import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";


// ✅ Upload full product (expects Cloudinary image URL from frontend)
export const uploadProduct = async (req, res) => {
  try {
    console.log("🛠 Raw req.body:", req.body);

    let { name, description, category, variants, baseImage } = req.body;

    console.log("🧾 name:", name);
    console.log("🧾 description:", description);
    console.log("🧾 category:", category);
    console.log("🧾 baseImage:", baseImage);
    console.log("🧾 variants:", variants);

    // If variants is a string (because of JSON.stringify), parse it
    if (typeof variants === "string") {
      try {
        variants = JSON.parse(variants);
        console.log("✅ Parsed variants:", variants);
      } catch (err) {
        console.error("❌ Failed to parse variants");
        return res.status(400).json({ message: "Invalid variants JSON" });
      }
    }

    // Validate
    if (!name || !description || !category || !baseImage || !Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const finalVariants = variants.map((variant) => ({
      size: variant.size || "Free Size",
      color: variant.color || "Standard",
      type: variant.type || "Default",
      price: Number(variant.price),
      stock: Number(variant.stock),
      image: variant.image || baseImage,
    }));

    const newProduct = new Product({
      name,
      description,
      category,
      baseImage,
      variants: finalVariants,
    });

    await newProduct.save();
    return res.status(201).json({ message: "✅ Product uploaded", product: newProduct });
  } catch (error) {
    console.error("❌ Upload error:", error);
    return res.status(500).json({ message: "Upload failed", error: error.message });
  }
};


// ✅ Get all products (with optional search/filter/sort)
export const getAllProducts = async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = {};

    if (category && category !== "all") {
      query.category = new RegExp(`^${category}$`, "i");
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    let productsQuery = Product.find(query);

    // Optional sorting
    if (sort === "asc") {
      productsQuery = productsQuery.sort({ "variants.0.price": 1 });
    } else if (sort === "desc") {
      productsQuery = productsQuery.sort({ "variants.0.price": -1 });
    } else if (sort === "name-asc") {
      productsQuery = productsQuery.sort({ name: 1 });
    } else if (sort === "name-desc") {
      productsQuery = productsQuery.sort({ name: -1 });
    }

    const products = await productsQuery;
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "❌ Failed to fetch products", error: err.message });
  }
};
// ✅ Get single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "❌ Failed to fetch product", error: error.message });
  }
};
// ✅ Update product by ID (Admin)
export const updateProduct = async (req, res) => {
  try {
    const { name, description, category, variants, baseImage } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    product.name = name || product.name;
    product.description = description || product.description;
    product.category = category || product.category;

    if (variants) {
      product.variants = typeof variants === "string" ? JSON.parse(variants) : variants;
    }

    if (baseImage) {
      product.baseImage = baseImage;
    }

    await product.save();
    res.json({ message: "✅ Product updated", product });
  } catch (err) {
    res.status(500).json({ message: "❌ Failed to update product", error: err.message });
  }
};
// ✅ Create product (for Postman or testing)
export const createProduct = async (req, res) => {
  try {
    const { name, description, category, price, stock, image } = req.body;

    if (!name || !category || !price || !stock || !image) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newProduct = new Product({
      name,
      description,
      category,
      baseImage: image,
      variants: [
        {
          size: "Free Size",
          color: "Standard",
          type: "Default",
          price: parseFloat(price),
          stock: parseInt(stock),
          image,
        },
      ],
    });

    await newProduct.save();
    res.status(201).json({ message: "✅ Product created", product: newProduct });
  } catch (error) {
    console.error("Raw product creation error:", error);
    res.status(500).json({ message: "❌ Failed to create product", error: error.message });
  }
};
// ✅ Delete product by ID (Admin)
export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "🗑️ Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "❌ Failed to delete product", error: error.message });
  }
};

