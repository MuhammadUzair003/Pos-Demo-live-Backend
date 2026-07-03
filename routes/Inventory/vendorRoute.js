const express = require('express');
const router = express.Router();
const { addVendor,getAllVendors, deleteVendor ,updateVendor } = require('../../controllers/Inventory/vendorController');
const { isVerifiedUser } = require("../../middleware/tokenVerification");

router.route("/").get( isVerifiedUser, getAllVendors );
router.route("/").post( isVerifiedUser, addVendor );

router.route('/:_id')
  .put(isVerifiedUser, updateVendor)  
  .delete(isVerifiedUser, deleteVendor);  

module.exports = router;