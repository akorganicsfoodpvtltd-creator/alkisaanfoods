import express from 'express';
import { 
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getOrdersByEmail,
  exportOrders
} from '../controllers/orderController.js';

const router = express.Router();

// Create new order (with automatic email confirmation)
router.post('/', createOrder);

// Get all orders (admin)
router.get('/', getOrders);

// Get order by ID
router.get('/:id', getOrderById);

// Update order status
router.put('/:id/status', updateOrderStatus);

// Get orders by email (user)
router.get('/by-email/:email', getOrdersByEmail);

// Export orders to Excel
router.get('/export/excel', exportOrders);

export default router;