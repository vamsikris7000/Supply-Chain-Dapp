const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
} = require('../controllers/productController');

// Routes
router.route('/').get(getProducts).post(createProduct);
router.route('/:id').get(getProductById).put(updateProduct);

module.exports = router; 