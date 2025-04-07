const Product = require('../models/productModel');

// @desc    Create a new product
// @route   POST /api/products
// @access  Public
const createProduct = async (req, res) => {
  try {
    const {
      productId,
      manufacturerName,
      manufacturerDetails,
      manufacturerLocation,
      productName,
      productCode,
      productPrice,
      productCategory,
      currentOwner,
      transactionHash,
    } = req.body;

    // Check if product with same ID already exists
    const productExists = await Product.findOne({ productId });

    if (productExists) {
      return res.status(400).json({ message: 'Product already exists' });
    }

    // Create new product
    const product = await Product.create({
      productId,
      manufacturerName,
      manufacturerDetails,
      manufacturerLocation,
      productName,
      productCode,
      productPrice,
      productCategory,
      currentOwner,
      productStatus: 'Manufactured',
      transactionHistory: [
        {
          action: 'Manufactured',
          timestamp: Date.now(),
          transactionHash,
          fromAddress: currentOwner,
          toAddress: currentOwner,
        },
      ],
    });

    if (product) {
      res.status(201).json(product);
    } else {
      res.status(400).json({ message: 'Invalid product data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ productId: req.params.id });

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update product status and transaction history
// @route   PUT /api/products/:id
// @access  Public
const updateProduct = async (req, res) => {
  try {
    const {
      productStatus,
      action,
      transactionHash,
      fromAddress,
      toAddress,
    } = req.body;

    const product = await Product.findOne({ productId: req.params.id });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update product status
    product.productStatus = productStatus || product.productStatus;
    product.currentOwner = toAddress || product.currentOwner;

    // Add to transaction history
    if (action && transactionHash) {
      product.transactionHistory.push({
        action,
        timestamp: Date.now(),
        transactionHash,
        fromAddress: fromAddress || product.currentOwner,
        toAddress: toAddress || product.currentOwner,
      });
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
}; 