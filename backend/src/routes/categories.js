const express = require('express');
const router = express.Router();
const { getAllCategories, getCategory, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { auth, adminAuth } = require('../middleware/auth');

router.get('/', getAllCategories);
router.get('/:id', getCategory);
router.post('/', auth, adminAuth, createCategory);
router.put('/:id', auth, adminAuth, updateCategory);
router.delete('/:id', auth, adminAuth, deleteCategory);

module.exports = router;
