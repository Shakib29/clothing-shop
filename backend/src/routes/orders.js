const express = require('express');
const router = express.Router();
const {
  createOrder, getMyOrders, getOrder, getAllOrders, getOrderById, updateOrderStatus,
} = require('../controllers/orderController');
const { auth, adminAuth } = require('../middleware/auth');

router.post('/', auth, createOrder);
router.get('/my-orders', auth, getMyOrders);
router.get('/:id', auth, getOrder);
router.get('/', auth, adminAuth, getAllOrders);
router.get('/admin/:id', auth, adminAuth, getOrderById);
router.put('/:id/status', auth, adminAuth, updateOrderStatus);

module.exports = router;
