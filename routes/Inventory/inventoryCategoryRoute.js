const express = require('express');
const router = express.Router();
const {
  addInventoryCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} = require('../../controllers/Inventory/inventoryCategoryController');

const { isVerifiedUser } = require("../../middleware/tokenVerification");

// Routes for /api/category
router.route('/')
  .post(isVerifiedUser, addInventoryCategory)   
  .get(isVerifiedUser, getAllCategories); 

// Routes for /api/category/:id
router.route('/:id')
  .get(isVerifiedUser, getCategoryById)  
  .put(isVerifiedUser, updateCategory)   
  .delete(isVerifiedUser, deleteCategory); 

module.exports = router;
