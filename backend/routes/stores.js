// backend/routes/storeRoutes.js
import express from "express";
import db from "../config/db.js";

const router = express.Router();

// GET /api/stores — fetch all stores for headline ticker and nearest store
router.get("/", async (req, res) => {
  try {
    console.log("📡 Fetching all stores from stores_branches table...");
    
    // Check what columns exist
    const [columns] = await db.execute("SHOW COLUMNS FROM stores_branches");
    console.log("Store table columns:", columns.map(col => col.Field));
    
    // IMPORTANT: Select ALL columns including latitude and longitude for nearest store functionality
    const [rows] = await db.execute(
      `SELECT 
        id, 
        \`Store Name\` as store_name, 
        store_image,
        Branch as branch_name,
        City as city,
        Address as address,
        \`Phone Number\` as phone,
        latitude,
        longitude,
        created_at
      FROM stores_branches 
      ORDER BY id DESC`
    );

    console.log(`✅ Fetched ${rows.length} stores from database`);
    
    if (rows.length > 0) {
      console.log("Sample store data with coordinates:", {
        id: rows[0].id,
        store_name: rows[0].store_name,
        latitude: rows[0].latitude,
        longitude: rows[0].longitude
      });
    } else {
      console.log("⚠️ No stores found in database");
    }

    // Return rows (even if empty)
    res.status(200).json(rows);
    
  } catch (err) {
    console.error("❌ Error fetching stores:", err);
    res.status(500).json({ 
      error: "Failed to fetch stores", 
      details: err.message 
    });
  }
});

// GET /api/stores/:id — get single store by ID (for editing)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await db.execute(
      `SELECT 
        id, 
        \`Store Name\` as store_name, 
        store_image,
        Branch as branch_name,
        City as city,
        Address as address,
        \`Phone Number\` as phone,
        latitude,
        longitude
      FROM stores_branches 
      WHERE id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }

    console.log("✅ Fetched store for edit:", rows[0]);
    res.json({ success: true, store: rows[0] });
    
  } catch (err) {
    console.error("❌ Error fetching store:", err);
    res.status(500).json({ success: false, message: "Failed to fetch store" });
  }
});

// POST /api/stores — add new store
router.post("/", async (req, res) => {
  try {
    console.log('📝 Adding store request body:', req.body);
    
    const { 
      store_name, 
      city, 
      branch_name, 
      address, 
      phone, 
      latitude, 
      longitude,
      store_image
    } = req.body;
    
    // Validation
    if (!store_name || !city || !address || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: "Store name, city, address, and phone are required" 
      });
    }

    const [result] = await db.execute(
      `INSERT INTO stores_branches 
      (\`Store Name\`, City, Branch, Address, \`Phone Number\`, latitude, longitude, store_image) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        store_name, 
        city, 
        branch_name || 'Main', 
        address, 
        phone, 
        latitude || null, 
        longitude || null,
        store_image || null
      ]
    );

    // Get the inserted store
    const [newStore] = await db.execute(
      `SELECT 
        id, 
        \`Store Name\` as store_name, 
        store_image,
        Branch as branch_name,
        City as city,
        Address as address,
        \`Phone Number\` as phone,
        latitude,
        longitude
      FROM stores_branches 
      WHERE id = ?`,
      [result.insertId]
    );

    console.log("✅ Store added successfully:", newStore[0]);
    
    res.status(201).json({ 
      success: true, 
      message: "Store added successfully",
      store: newStore[0]
    });
    
  } catch (err) {
    console.error("❌ Error adding store:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to add store: " + err.message 
    });
  }
});

// PUT /api/stores/:id — update store by ID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📝 Updating store ID:', id);
    console.log('Request body:', req.body);
    
    const { 
      store_name, 
      city, 
      branch_name, 
      address, 
      phone, 
      latitude, 
      longitude,
      store_image
    } = req.body;
    
    // Validation
    if (!store_name || !city || !address || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: "Store name, city, address, and phone are required" 
      });
    }
    
    // Check if store exists
    const [existing] = await db.execute(
      "SELECT * FROM stores_branches WHERE id = ?",
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }

    // Update all fields including image and coordinates
    const query = `UPDATE stores_branches 
       SET \`Store Name\` = ?, 
           City = ?, 
           Branch = ?, 
           Address = ?, 
           \`Phone Number\` = ?, 
           latitude = ?, 
           longitude = ?,
           store_image = ?
       WHERE id = ?`;
      
    const values = [
      store_name, 
      city, 
      branch_name || 'Main', 
      address, 
      phone, 
      latitude || null, 
      longitude || null,
      store_image !== undefined ? store_image : existing[0].store_image,
      id
    ];

    await db.execute(query, values);

    // Get updated store
    const [updated] = await db.execute(
      `SELECT 
        id, 
        \`Store Name\` as store_name, 
        store_image,
        Branch as branch_name,
        City as city,
        Address as address,
        \`Phone Number\` as phone,
        latitude,
        longitude
      FROM stores_branches 
      WHERE id = ?`,
      [id]
    );

    console.log("✅ Store updated successfully:", updated[0]);
    
    res.json({ 
      success: true, 
      message: "Store updated successfully",
      store: updated[0]
    });
    
  } catch (err) {
    console.error("❌ Error updating store:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update store: " + err.message 
    });
  }
});

// DELETE /api/stores/:id — delete store by ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if store exists
    const [existing] = await db.execute(
      "SELECT * FROM stores_branches WHERE id = ?",
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }

    await db.execute("DELETE FROM stores_branches WHERE id = ?", [id]);
    
    console.log(`✅ Store ID ${id} deleted successfully`);
    
    res.json({ 
      success: true, 
      message: "Store deleted successfully"
    });
    
  } catch (err) {
    console.error("❌ Error deleting store:", err);
    res.status(500).json({ success: false, message: "Failed to delete store" });
  }
});

export default router;
