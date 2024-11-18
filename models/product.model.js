const mongoose = require('mongoose');
const ProductSchema = mongoose.Schema({
    name: {type: String, 
        required: [true, "name for product is required"],},
    price: {type: Number,
        required: [true, "price for product is required"],},
    quantity: {type: Number,
        required: [true, "quantity for product is required"],},
    description : {type: String,
        required: [true, "description for product is required"],},
    image: {type: String,
        required: [false, "image for product is not required"],},
}, {
    timestamps: true
});
const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;
