import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/cart', authMiddleware, (req, res) => {
  // Fetch user cart
});

export default router;
