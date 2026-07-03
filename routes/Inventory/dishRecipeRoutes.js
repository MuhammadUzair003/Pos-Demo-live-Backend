// routes/dishRecipeRoutes.js
const express = require('express');
const router = express.Router();

const {
  addRecipe,
  getAllRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  getRecipeByDishAndVariation,
} = require('../../controllers/Inventory/dishRecipeController');

const { adjustStockByRecipe, rollbackRecipeStock } = require('../../controllers/Inventory/recipeStockController');

const { isVerifiedUser } = require('../../middleware/tokenVerification');

// Routes for /api/dish-recipe
router.route('/')
  .post(isVerifiedUser, addRecipe)     
  .get(isVerifiedUser, getAllRecipes);  

// Routes for /api/dish-recipe/:id
router.route('/:id')
  .get(isVerifiedUser, getRecipeById)   
  .put(isVerifiedUser, updateRecipe)    
  .delete(isVerifiedUser, deleteRecipe);

// Route for /api/dish-recipe/by/dish-variation
router.get('/by/dish-variation', isVerifiedUser, getRecipeByDishAndVariation); 

// new:
router.post('/:id/stock-out', isVerifiedUser, adjustStockByRecipe);
router.post('/txn/:id/rollback', isVerifiedUser, rollbackRecipeStock);

module.exports = router;
