import express from 'express';
const router = express.Router();

// Import your controller functions
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../controllers/cartController.js';

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:id', updateCartItem);
router.delete('/:id', removeCartItem);
router.delete('/', clearCart); // Clear all

export default router;
