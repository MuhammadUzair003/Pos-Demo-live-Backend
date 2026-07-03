



const express = require('express');
const router = express.Router();
const { 
    addCustomer,    
    searchCustomer, 
    deleteCustomer,
    getAllCustomers 
} = require("../controllers/deliveryCustomerController");
const { isVerifiedUser } = require('../middleware/tokenVerification');

router.route("/")
    
    .post(isVerifiedUser, addCustomer); 


router.route("/search")
    .get(isVerifiedUser, searchCustomer); 


router.route("/:phone")
    .delete(isVerifiedUser, deleteCustomer);

    router.route('/').get(isVerifiedUser, getAllCustomers);
module.exports = router;