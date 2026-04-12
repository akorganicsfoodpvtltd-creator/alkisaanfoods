import db from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

// ✅ NAYA — cross domain kaam karega
const getSessionId = (req, res) => {
  let sessionId = req.cookies?.sessionId;
  if (!sessionId) {
    sessionId = uuidv4();
    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      secure: true,        // ✅ always true
      sameSite: "none",    // ✅ cross domain allow karo
    });
  }
  return sessionId;
};

// Helper: build cart condition and params
const buildCartCondition = (userId, sessionId) => {
  if (userId) {
    return { condition: 'user_id = ?', param: userId };
  }
  return { condition: 'session_id = ?', param: sessionId };
};

// GET CART
export const getCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const sessionId = getSessionId(req, res);

    const { condition, param } = buildCartCondition(userId, sessionId);

    // FIXED: Simplified query without ambiguous aliases
    const query = `
      SELECT 
        cart.id, 
        cart.quantity, 
        products.id AS product_id, 
        products.name, 
        products.price, 
        products.image, 
        products.category
      FROM cart
      INNER JOIN products ON cart.product_id = products.id
      WHERE ${condition}
    `;

    const [cartItems] = await db.query(query, [param]);

    // Add full image URL for frontend
    const itemsWithImages = cartItems.map(item => ({
      ...item,
      image_url: item.image 
        ? `http://localhost:5000/${item.image.startsWith('uploads/') ? '' : 'uploads/'}${item.image}`
        : null
    }));

    res.json({ success: true, items: itemsWithImages });
  } catch (error) {
    console.error('GetCart Error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch cart" });
  }
};

// ADD TO CART
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID required" });
    }

    const userId = req.user?.id;
    const sessionId = getSessionId(req, res);

    // Check product exists
    const [product] = await db.query("SELECT id, name FROM products WHERE id = ?", [productId]);
    if (!product.length) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const { condition, param } = buildCartCondition(userId, sessionId);

    // FIXED: Simplified query - removed alias 'c.'
    // Check if already in cart
    const [existingItem] = await db.query(
      `SELECT id, quantity FROM cart WHERE ${condition} AND product_id = ?`,
      [param, productId]
    );

    if (existingItem.length) {
      const newQuantity = existingItem[0].quantity + quantity;
      await db.query("UPDATE cart SET quantity = ? WHERE id = ?", [newQuantity, existingItem[0].id]);
      return res.json({ 
        success: true, 
        message: "Cart updated", 
        productName: product[0].name,
        cartItem: {
          id: existingItem[0].id,
          product_id: productId,
          quantity: newQuantity
        }
      });
    }

    // Insert new item
    const insertQuery = `
      INSERT INTO cart (${userId ? 'user_id' : 'session_id'}, product_id, quantity) 
      VALUES (?, ?, ?)
    `;
    const [result] = await db.query(insertQuery, [param, productId, quantity]);

    res.json({ 
      success: true, 
      message: "Item added", 
      productName: product[0].name,
      cartItem: {
        id: result.insertId,
        product_id: productId,
        quantity: quantity
      }
    });
  } catch (error) {
    console.error('AddToCart Error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to add to cart",
      error: error.message,
      sql: error.sql 
    });
  }
};

// UPDATE CART ITEM
export const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: "Invalid quantity" });
    }

    const userId = req.user?.id;
    const sessionId = getSessionId(req, res);
    const { condition, param } = buildCartCondition(userId, sessionId);

    // Verify item belongs to user/session
    // FIXED: Simplified query
    const [item] = await db.query(
      `SELECT id FROM cart WHERE id = ? AND ${condition}`,
      [id, param]
    );
    
    if (!item.length) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    await db.query("UPDATE cart SET quantity = ? WHERE id = ?", [quantity, id]);
    res.json({ success: true, message: "Cart updated" });
  } catch (error) {
    console.error('UpdateCart Error:', error);
    res.status(500).json({ success: false, message: "Failed to update cart" });
  }
};

// REMOVE CART ITEM
export const removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const userId = req.user?.id;
    const sessionId = getSessionId(req, res);
    const { condition, param } = buildCartCondition(userId, sessionId);

    // Verify item belongs to user/session
    const [item] = await db.query(
      `SELECT id FROM cart WHERE id = ? AND ${condition}`,
      [id, param]
    );
    
    if (!item.length) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    await db.query("DELETE FROM cart WHERE id = ?", [id]);
    res.json({ success: true, message: "Item removed" });
  } catch (error) {
    console.error('RemoveCart Error:', error);
    res.status(500).json({ success: false, message: "Failed to remove item" });
  }
};

// CLEAR CART
export const clearCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const sessionId = getSessionId(req, res);
    const { condition, param } = buildCartCondition(userId, sessionId);

    await db.query(`DELETE FROM cart WHERE ${condition}`, [param]);
    res.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    console.error('ClearCart Error:', error);
    res.status(500).json({ success: false, message: "Failed to clear cart" });
  }
};

// MERGE GUEST CART TO USER CART (for after login)
export const mergeGuestCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.cookies?.sessionId;

    if (!sessionId) {
      return res.json({ success: true, message: "No guest cart to merge" });
    }

    // Get guest cart items
    const [guestItems] = await db.query(
      "SELECT product_id, quantity FROM cart WHERE session_id = ?",
      [sessionId]
    );

    if (guestItems.length === 0) {
      return res.json({ success: true, message: "No guest cart items" });
    }

    // For each guest item, merge with user cart
    for (const guestItem of guestItems) {
      // Check if user already has this item
      const [userItem] = await db.query(
        "SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?",
        [userId, guestItem.product_id]
      );

      if (userItem.length > 0) {
        // Update quantity
        const newQuantity = userItem[0].quantity + guestItem.quantity;
        await db.query(
          "UPDATE cart SET quantity = ? WHERE id = ?",
          [newQuantity, userItem[0].id]
        );
      } else {
        // Insert new item for user
        await db.query(
          "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
          [userId, guestItem.product_id, guestItem.quantity]
        );
      }
    }

    // Delete guest cart
    await db.query("DELETE FROM cart WHERE session_id = ?", [sessionId]);

    res.json({ success: true, message: "Cart merged successfully" });
  } catch (error) {
    console.error('MergeCart Error:', error);
    res.status(500).json({ success: false, message: "Failed to merge cart" });
  }
};
