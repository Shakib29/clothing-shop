const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllCustomers, getCustomerOrders } = require('../controllers/adminController');
const { auth, adminAuth } = require('../middleware/auth');

router.get('/dashboard', auth, adminAuth, getDashboardStats);
router.get('/customers', auth, adminAuth, getAllCustomers);
router.get('/customers/:id/orders', auth, adminAuth, getCustomerOrders);

module.exports = router;
