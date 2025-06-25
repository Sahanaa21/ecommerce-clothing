import Product from "../models/Product.js";

// ✅ Create product via raw JSON (Postman)
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

// ✅ Upload product (image-based - Admin panel)
export const uploadProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;
    const baseImage = req.file ? `/uploads/${req.file.filename}` : null;

    if (!name || !category || !price || !stock || !baseImage) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newProduct = new Product({
      name,
      description,
      category,
      baseImage,
      variants: [
        {
          size: "Free Size",
          color: "Standard",
          type: "Default",
          price: parseFloat(price),
          stock: parseInt(stock),
          image: baseImage,
        },
      ],
    });

    await newProduct.save();
    res.status(201).json({ message: "✅ Product uploaded with image", product: newProduct });
  } catch (error) {
    console.error("❌ Product upload error:", error);
    res.status(500).json({ message: "Failed to upload product", error: error.message });
  }
};

// ✅ Get all products (with filters & sorting)
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

    // Sorting
    if (sort === "asc") productsQuery = productsQuery.sort({ "variants.0.price": 1 });
    else if (sort === "desc") productsQuery = productsQuery.sort({ "variants.0.price": -1 });
    else if (sort === "name-asc") productsQuery = productsQuery.sort({ name: 1 });
    else if (sort === "name-desc") productsQuery = productsQuery.sort({ name: -1 });

    const products = await productsQuery;
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "❌ Failed to fetch products", error: err.message });
  }
};

// ✅ Get product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "❌ Failed to fetch product", error: error.message });
  }
};

// ✅ Update product (Admin)
export const updateProduct = async (req, res) => {
  try {
    const { name, description, category, variants } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    product.name = name || product.name;
    product.description = description || product.description;
    product.category = category || product.category;

    if (variants) {
      product.variants = typeof variants === "string" ? JSON.parse(variants) : variants;
    }

    if (req.file) {
      product.baseImage = `/uploads/${req.file.filename}`;
    }

    await product.save();
    res.json({ message: "✅ Product updated", product });
  } catch (err) {
    res.status(500).json({ message: "❌ Failed to update product", error: err.message });
  }
};

// ✅ Delete product
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "🗑️ Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "❌ Failed to delete product", error: error.message });
  }
};
