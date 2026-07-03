const express = require('express');
const router = express.Router();
const { isVerifiedUser } = require("../../middleware/tokenVerification");
const { getTransactions, deleteTransaction,} = require('../../controllers/Inventory/transactionController');


router.route('/').get ( isVerifiedUser, getTransactions);




router.route('/:id')
  
  .delete(isVerifiedUser, deleteTransaction);  

module.exports = router;

// router.route("/").get( isVerifiedUser, getAllVendors );