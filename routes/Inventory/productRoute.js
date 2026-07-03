const express = require('express');
const router = express.Router();
const { addProduct, getAllProducts, deleteProduct, adjustStock, updateProduct } = require('../../controllers/Inventory/productController');
const { isVerifiedUser } = require("../../middleware/tokenVerification");

// Routes for /api/product
router.route('/')
  .post(isVerifiedUser, addProduct)  
  .get(isVerifiedUser, getAllProducts);  

// Routes for /api/product/:id
router.route('/:id')
  .put(isVerifiedUser, updateProduct)  
  .delete(isVerifiedUser, deleteProduct);  

// Route for adjusting stock
router.route('/:id/stock')
  .patch(isVerifiedUser, adjustStock);  

module.exports = router;