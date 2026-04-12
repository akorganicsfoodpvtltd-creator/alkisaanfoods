import express from 'express';
import jwt from 'jsonwebtoken';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../controllers/cartController.js';

const router = express.Router();

// ✅ Optional auth — login ho ya na ho dono kaam kare
const optionalAuth = (req, res, next) => {
  const token = req.cookies?.jwt || req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (e) {
      // Invalid token — guest treat karo
    }
  }
  next();
};

router.get('/', optionalAuth, getCart);
router.post('/', optionalAuth, addToCart);
router.put('/:id', optionalAuth, updateCartItem);
router.delete('/:id', optionalAuth, removeCartItem);
router.delete('/', optionalAuth, clearCart);

export default router;
