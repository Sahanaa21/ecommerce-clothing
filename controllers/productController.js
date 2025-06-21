import Product from "../models/Product.js";

// ✅ Create product manually (POST: /api/products)
export const createProduct = async (req, res) => {
  try {
    const { name, description, category, baseImage, variants } = req.body;

    if (!name || !category || !baseImage || !variants || variants.length === 0) {
      return res.status(400).json({ message: "Missing required fields or variants" });
    }

    const newProduct = new Product({
      name,
      description,
      category,
      baseImage,
      variants, // expects array of { size, color, type, price, stock, image? }
    });

    await newProduct.save();
    res.status(201).json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Failed to create product", error: error.message });
  }
};

// ✅ Upload product (admin route with baseImage + variants via multipart/form-data)
export const uploadProduct = async (req, res) => {
  try {
    const { name, description, category, variants } = req.body;
    const baseImage = req.file ? `/uploads/${req.file.filename}` : null;

    if (!name || !category || !baseImage || !variants) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const parsedVariants = JSON.parse(variants); // variants comes as JSON string in multipart

    const newProduct = new Product({
      name,
      description,
      category,
      baseImage,
      variants: parsedVariants,
    });

    await newProduct.save();
    res.status(201).json({ message: "Product uploaded with image", product: newProduct });
  } catch (error) {
    console.error("Product upload error:", error);
    res.status(500).json({ message: "Failed to upload product", error: error.message });
  }
};

// ✅ Get all products (with optional filters/sorting)
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

    if (sort === "asc") productsQuery = productsQuery.sort({ "variants.price": 1 });
    else if (sort === "desc") productsQuery = productsQuery.sort({ "variants.price": -1 });
    else if (sort === "name-asc") productsQuery = productsQuery.sort({ name: 1 });
    else if (sort === "name-desc") productsQuery = productsQuery.sort({ name: -1 });

    const products = await productsQuery;
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products", error: err.message });
  }
};

// ✅ Get product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product", error: error.message });
  }
};

// ✅ Update product by ID (with image optional)
export const updateProduct = async (req, res) => {
  try {
    const { name, description, category, variants } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.name = name || product.name;
    product.description = description || product.description;
    product.category = category || product.category;

    if (variants) {
      product.variants = JSON.parse(variants); // must be stringified in multipart/form-data
    }

    if (req.file) {
      product.baseImage = `/uploads/${req.file.filename}`;
    }

    await product.save();
    res.json({ message: "Product updated successfully", product });
  } catch (err) {
    res.status(500).json({ message: "Failed to update product", error: err.message });
  }
};

// ✅ Delete product
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product", error: error.message });
  }
};
