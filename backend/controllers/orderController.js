import ExcelJS from 'exceljs';
import pool from '../config/db.js';
import { sendOrderConfirmationEmail } from '../utils/emailService.js';

// Get next sequential order ID in format ORD#001
const getNextOrderId = async () => {
  try {
    const [rows] = await pool.query(
      "SELECT order_id FROM orders WHERE order_id LIKE 'ORD#%' ORDER BY CAST(SUBSTRING(order_id, 5) AS UNSIGNED) DESC LIMIT 1"
    );
    
    if (rows.length === 0) {
      return 'ORD#001';
    }
    
    const lastOrderId = rows[0].order_id;
    const lastNumber = parseInt(lastOrderId.substring(4), 10);
    const nextNumber = lastNumber + 1;
    const paddedNumber = nextNumber.toString().padStart(3, '0');
    return `ORD#${paddedNumber}`;
  } catch (err) {
    console.error("Error generating order ID:", err);
    return 'ORD#001';
  }
};

// Get all orders
export const getOrders = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM orders 
      ORDER BY created_at DESC
    `);
    
    res.json({ success: true, orders: rows });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get single order by ID
export const getOrderById = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM orders WHERE id = ?", [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    
    res.json({ success: true, order: rows[0] });
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const [result] = await pool.query(
      "UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, message: "Order status updated successfully" });
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Export orders to Excel
export const exportOrders = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id,
        order_id,
        user_id,
        total_amount,
        payment_method,
        status,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at
      FROM orders 
      ORDER BY created_at DESC
    `);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "No orders found to export" });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');

    worksheet.columns = [
      { header: 'Order ID', key: 'order_id', width: 15 },
      { header: 'Customer ID', key: 'user_id', width: 15 },
      { header: 'Total Amount', key: 'total_amount', width: 15 },
      { header: 'Payment Method', key: 'payment_method', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Order Date', key: 'created_at', width: 20 }
    ];

    rows.forEach(order => {
      worksheet.addRow({
        order_id: order.order_id,
        user_id: order.user_id || 'Guest',
        total_amount: order.total_amount ? `Rs. ${parseFloat(order.total_amount).toFixed(2)}` : 'Rs. 0.00',
        payment_method: order.payment_method || 'N/A',
        status: order.status || 'pending',
        created_at: order.created_at
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F81BD' }
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=orders_export.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Error exporting orders:", err);
    res.status(500).json({ success: false, message: "Failed to export orders: " + err.message });
  }
};

// Create new order
export const createOrder = async (req, res) => {
  try {
    console.log("📦 Received order data:", JSON.stringify(req.body, null, 2));
    
    const { 
      items, 
      shippingInfo,
      totalAmount,
      paymentMethod,
      notes 
    } = req.body;
    
    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Order items are required" 
      });
    }
    
    if (!shippingInfo) {
      return res.status(400).json({ 
        success: false, 
        message: "Shipping information is required" 
      });
    }
    
    if (!shippingInfo.email) {
      return res.status(400).json({ 
        success: false, 
        message: "Customer email is required" 
      });
    }
    
    if (!totalAmount || isNaN(totalAmount)) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid total amount is required" 
      });
    }
    
    // Extract user_id from session or use guest
  // ✅ Use null instead of 'guest'
const user_id = req.user?.id || null;
    
    // Generate sequential order ID in format ORD#001
    const order_id = await getNextOrderId();
    
    // Create order record
    const [result] = await pool.query(
      `INSERT INTO orders 
       (order_id, user_id, items, shipping_info, total_amount, payment_method, status, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order_id,
        user_id,
        JSON.stringify(items),
        JSON.stringify(shippingInfo),
        parseFloat(totalAmount),
        paymentMethod || 'cod',
        'pending',
        notes || null
      ]
    );
    
    console.log("✅ Order inserted with ID:", result.insertId);
    console.log("✅ Order Number:", order_id);
    console.log("📧 Attempting to send confirmation email to:", shippingInfo.email);
    
    // Send email confirmation (don't await - let it run in background)
    sendOrderConfirmationEmail(shippingInfo.email, {
      orderId: order_id,
      customerName: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
      items: items,
      totalAmount: parseFloat(totalAmount),
      shippingAddress: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postalCode}`,
      phone: shippingInfo.phone,
      paymentMethod: paymentMethod || 'cod'
    }).catch(emailErr => {
      console.error(`❌ Background email sending failed for order ${order_id}:`, emailErr.message);
      // Don't throw - order is still successful
    });
    
    res.status(201).json({
      success: true,
      message: "Order created successfully",
      orderId: order_id,
      order: {
        id: result.insertId,
        order_id: order_id,
        user_id: user_id,
        items: items,
        shipping_info: shippingInfo,
        total_amount: parseFloat(totalAmount),
        payment_method: paymentMethod || 'cod',
        status: 'pending'
      }
    });
    
  } catch (err) {
    console.error("❌ Error creating order:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error: " + err.message,
      error: err.message 
    });
  }
};

// Get orders by email
export const getOrdersByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    
    const [rows] = await pool.query(`
      SELECT * FROM orders 
      WHERE JSON_UNQUOTE(JSON_EXTRACT(shipping_info, '$.email')) = ?
      ORDER BY created_at DESC
    `, [email]);
    
    res.json({ success: true, orders: rows });
  } catch (err) {
    console.error("Error fetching orders by email:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
