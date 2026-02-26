// controllers/productController.js
import db from "../config/db.js"; // your MySQL connection pool

// Get all products with optional search, category, pagination
export const getProducts = async (req, res) => {
  try {
    let { search, category, page = 1, limit = 12 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    let query = "SELECT * FROM products WHERE 1=1";
    const params = [];

    if (search) {
      query += " AND (name LIKE ? OR category LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      query += " AND category = ?";
      params.push(category);
    }

    // Get total count for pagination
    const [totalRows] = await db.query(`SELECT COUNT(*) AS total FROM products WHERE 1=1 ${search ? " AND (name LIKE ? OR category LIKE ?)" : ""}${category ? " AND category = ?" : ""}`, params);
    const total = totalRows[0].total;

    // Add pagination
    query += " LIMIT ? OFFSET ?";
    params.push(limit, (page - 1) * limit);

    const [products] = await db.query(query, params);

    res.status(200).json({
      products,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error in getProducts:", error);
    res.status(500).json({ message: "Server error while fetching products" });
  }
};

// Get single product by ID
export const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [productId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error in getProductById:", error);
    res.status(500).json({ message: "Server error while fetching product" });
  }
};
