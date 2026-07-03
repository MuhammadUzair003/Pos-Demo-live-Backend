const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    
    orderNo: {
        type: String,
        required: true,
    },
    orderId: {
        type: String,
        required: true,
        unique: true 
    },

    customerDetails: {
        name: { type: String }, 
        phone: { type: String },
        guests: { type: Number, default: 1 },
        orderType: {
            type: String,
            required: true,
        }
    },

    comment: { type: String, default: "" , trim:true},

    deliveryBoyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeliveryBoy',
        default: null,
    },
    
    deliveryAddress: {
        type: String,
        default: null
    },

    orderStatus: {
        type: String,
        required: true,
    },
    
    bills: {
        total: { type: Number, required: true },
        tax: { type: Number, required: true },
        totalWithTax: { type: Number, required: true },
        discountPercentage: { type: Number, default: 0 },
        discountAmount: { type: Number, default: 0 }
    },

    items: [{}],
    
    table: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Table",
    },
    paymentMethod: { type: String }
}, { timestamps: true });

// ============================================
// 🔥 PERFORMANCE INDEXES (NO DUPLICATES)
// ============================================

orderSchema.index({ createdAt: -1 });

orderSchema.index({ orderStatus: 1, createdAt: -1 });


orderSchema.index({ 'customerDetails.orderType': 1, createdAt: -1 });


orderSchema.index({ paymentMethod: 1, createdAt: -1 });


orderSchema.index({ 
    orderStatus: 1, 
    'customerDetails.orderType': 1, 
    createdAt: -1 
});

orderSchema.index({ 'items.name': 1 });


orderSchema.index({ deliveryBoyId: 1, orderStatus: 1 });



module.exports = mongoose.model("Order", orderSchema);