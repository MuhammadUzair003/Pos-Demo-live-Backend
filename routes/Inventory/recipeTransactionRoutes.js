const express = require('express');
const router = express.Router();
const {
    getAllRecipeTransactions,
    getRecipeTransactionById,
    deleteRecipeTransaction,
    // rollbackRecipeTransaction,
    getRecipeTransactionSummary,
} = require('../../controllers/Inventory/recipeTransactionController');

const { rollbackRecipeStock,adjustStockByRecipe } = require('../../controllers/Inventory/recipeStockController');

const { isVerifiedUser } = require('../../middleware/tokenVerification');


router.route('/')
    .get(isVerifiedUser, getAllRecipeTransactions); 


router.route('/summary')
    .get(isVerifiedUser, getRecipeTransactionSummary); 


router.route('/:id')
    .get(isVerifiedUser, getRecipeTransactionById)   
    .delete(isVerifiedUser, deleteRecipeTransaction); 

   
router.route('/:id/rollback')
    .post(isVerifiedUser, rollbackRecipeStock); 

router.route('/:id/stock-out')
    .post(isVerifiedUser, adjustStockByRecipe); 


module.exports = router;
