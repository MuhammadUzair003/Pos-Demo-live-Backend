// routes/deliveryBoyRoutes.js
const express = require('express');
const router = express.Router();
const { 
    addDeliveryBoy, 
    getDeliveryBoys, 
    updateDeliveryBoy, 
    deleteDeliveryBoy 
} = require("../controllers/deliveryBoyController");
const { isVerifiedUser } = require('../middleware/tokenVerification');

// NOTE: All these routes require authorization (isVerifiedUser)

router.route("/")
    .get(isVerifiedUser, getDeliveryBoys)
    .post(isVerifiedUser, addDeliveryBoy);

// PATCH: Update a delivery boy's details or status
router.route("/:id")
    .patch(isVerifiedUser, updateDeliveryBoy)
    .delete(isVerifiedUser, deleteDeliveryBoy);

module.exports = router;