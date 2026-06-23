const express = require('express');
const router = express.Router();
const {
  getAllProducts, getProduct, getProductById, getFeaturedProducts, getNewArrivals,
  createProduct, updateProduct, deleteProduct, updateStock, getLowStockProducts,
} = require('../controllers/productController');
const { auth, adminAuth } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/low-stock', auth, adminAuth, getLowStockProducts);
router.get('/slug/:slug', getProduct);
router.get('/:id', getProductById);
router.post('/', auth, adminAuth, upload.array('images', 10), createProduct);
router.put('/:id', auth, adminAuth, upload.array('images', 10), updateProduct);
router.delete('/:id', auth, adminAuth, deleteProduct);
router.put('/:id/stock', auth, adminAuth, updateStock);

module.exports = router;
