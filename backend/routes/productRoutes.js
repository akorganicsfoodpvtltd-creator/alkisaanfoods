// backend/routes/productRoutes.js
import express from "express";
import pool from "../config/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// GET /api/products — fetch all products
router.get("/", async (req, res) => {
  try {
    // Check what columns exist in your Products table
    const [columns] = await pool.query("SHOW COLUMNS FROM Products");
    console.log("Product table columns:", columns.map(col => col.Field));
    
    // Fetch products - adjust columns based on your actual table structure
    const [products] = await pool.query("SELECT * FROM Products ORDER BY id DESC");
    
    res.json({ success: true, products: products });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/products/:id — fetch single product
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM Products WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, product: rows[0] });
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/products — add new product (FOR JSON DATA WITH CLOUDINARY URL)
router.post("/", async (req, res) => {
  try {
    console.log('Adding product request body:', req.body);
    
    const { name, category, price, description, image } = req.body;
    
    // Validation
    if (!name || !category || !price) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, category, and price are required fields" 
      });
    }

    // Check what columns exist in your Products table
    const [columns] = await pool.query("SHOW COLUMNS FROM Products");
    const columnNames = columns.map(col => col.Field);
    console.log("Available columns:", columnNames);
    
    // Build dynamic query based on available columns
    let query = "INSERT INTO Products (name, category, price";
    let values = [name, category, parseFloat(price)];
    let placeholders = "?, ?, ?";
    
    if (columnNames.includes('description') && description) {
      query += ", description";
      placeholders += ", ?";
      values.push(description);
    }
    
    if (columnNames.includes('image')) {
      query += ", image";
      placeholders += ", ?";
      values.push(image || null); // Save the Cloudinary URL directly
    }
    
    query += `) VALUES (${placeholders})`;
    
    console.log("Query:", query);
    console.log("Values:", values);
    
    const [result] = await pool.query(query, values);

    // Get the inserted product
    const [newProduct] = await pool.query("SELECT * FROM Products WHERE id = ?", [result.insertId]);
    
    res.status(201).json({ 
      success: true, 
      message: "Product added successfully",
      product: newProduct[0]
    });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error: " + err.message 
    });
  }
});

// POST /api/products/upload — add new product with file upload
router.post("/upload", upload.single('image'), async (req, res) => {
  try {
    console.log('Adding product with file upload:');
    console.log('Body:', req.body);
    console.log('File:', req.file);
    
    const { name, category, price, description } = req.body;
    
    // Validation
    if (!name || !category || !price) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, category, and price are required fields" 
      });
    }

    // Get filename if file uploaded
    const image = req.file ? req.file.filename : null;
    
    // Check what columns exist in your Products table
    const [columns] = await pool.query("SHOW COLUMNS FROM Products");
    const columnNames = columns.map(col => col.Field);
    
    // Build dynamic query based on available columns
    let query = "INSERT INTO Products (name, category, price";
    let values = [name, category, parseFloat(price)];
    let placeholders = "?, ?, ?";
    
    if (columnNames.includes('description') && description) {
      query += ", description";
      placeholders += ", ?";
      values.push(description);
    }
    
    if (columnNames.includes('image')) {
      query += ", image";
      placeholders += ", ?";
      values.push(image);
    }
    
    query += `) VALUES (${placeholders})`;
    
    console.log("Query:", query);
    console.log("Values:", values);
    
    const [result] = await pool.query(query, values);

    // Get the inserted product
    const [newProduct] = await pool.query("SELECT * FROM Products WHERE id = ?", [result.insertId]);
    
    res.status(201).json({ 
      success: true, 
      message: "Product added successfully",
      product: newProduct[0]
    });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error: " + err.message 
    });
  }
});

// PUT /api/products/:id — update product (FOR JSON DATA WITH CLOUDINARY URL)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Updating product ID:', id);
    console.log('Request body:', req.body);
    
    const { name, category, price, description, image } = req.body;
    
    // Check if product exists
    const [existing] = await pool.query("SELECT * FROM Products WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Check what columns exist
    const [columns] = await pool.query("SHOW COLUMNS FROM Products");
    const columnNames = columns.map(col => col.Field);

    // Build dynamic update query
    let query = "UPDATE Products SET name = ?, category = ?, price = ?";
    let values = [name, category, parseFloat(price)];
    
    if (columnNames.includes('description')) {
      query += ", description = ?";
      values.push(description || null);
    }
    
    if (columnNames.includes('image')) {
      // If image is provided in request, use it, otherwise keep existing
      const imageValue = image !== undefined ? image : existing[0].image;
      query += ", image = ?";
      values.push(imageValue);
    }
    
    query += " WHERE id = ?";
    values.push(id);
    
    console.log("Update query:", query);
    console.log("Update values:", values);
    
    await pool.query(query, values);

    // Get updated product
    const [updated] = await pool.query("SELECT * FROM Products WHERE id = ?", [id]);
    
    res.json({ 
      success: true, 
      message: "Product updated successfully",
      product: updated[0]
    });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error: " + err.message 
    });
  }
});

// PUT /api/products/:id/upload — update product with file upload
router.put("/:id/upload", upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Updating product with file upload - ID:', id);
    console.log('Body:', req.body);
    console.log('File:', req.file);
    
    const { name, category, price, description } = req.body;
    
    // Check if product exists
    const [existing] = await pool.query("SELECT * FROM Products WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Check what columns exist
    const [columns] = await pool.query("SHOW COLUMNS FROM Products");
    const columnNames = columns.map(col => col.Field);
    
    let image;
    if (req.file) {
      image = req.file.filename;
      // Delete old image if exists
      if (existing[0].image && columnNames.includes('image')) {
        const oldImagePath = path.join('uploads/', existing[0].image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    } else {
      // Keep existing image
      image = existing[0].image;
    }

    // Build dynamic update query
    let query = "UPDATE Products SET name = ?, category = ?, price = ?";
    let values = [name, category, parseFloat(price)];
    
    if (columnNames.includes('description')) {
      query += ", description = ?";
      values.push(description || null);
    }
    
    if (columnNames.includes('image') && image !== undefined) {
      query += ", image = ?";
      values.push(image);
    }
    
    query += " WHERE id = ?";
    values.push(id);
    
    console.log("Update query:", query);
    console.log("Update values:", values);
    
    await pool.query(query, values);

    // Get updated product
    const [updated] = await pool.query("SELECT * FROM Products WHERE id = ?", [id]);
    
    res.json({ 
      success: true, 
      message: "Product updated successfully",
      product: updated[0]
    });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error: " + err.message 
    });
  }
});

// DELETE /api/products/:id — delete product
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if product exists
    const [existing] = await pool.query("SELECT * FROM Products WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Check if image column exists
    const [columns] = await pool.query("SHOW COLUMNS FROM Products");
    const columnNames = columns.map(col => col.Field);
    
    // Delete image file if exists and column exists
    if (columnNames.includes('image') && existing[0].image) {
      // Check if it's a file path (not a URL)
      if (!existing[0].image.startsWith('http')) {
        const imagePath = path.join('uploads/', existing[0].image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    }

    await pool.query("DELETE FROM Products WHERE id = ?", [id]);
    
    res.json({ 
      success: true, 
      message: "Product deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;