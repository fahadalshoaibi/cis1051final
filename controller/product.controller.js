const Product = require('../models/product.model');
const mongoose = require('mongoose');
const { classifyImage } = require('../services/tensorflow.service');

const ProductSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Product name is required"], // Required validation
        minlength: [3, "Product name must be at least 3 characters long"], // Minimum length
        maxlength: [100, "Product name cannot exceed 100 characters"], // Maximum length
    },
    price: {
        type: Number,
        required: [true, "Price is required"], // Required validation
        min: [0, "Price must be greater than or equal to 0"], // Minimum value
    },
    quantity: {
        type: Number,
        required: [true, "Quantity is required"], // Required validation
        min: [0, "Quantity must be at least 0"], // Minimum value
    },
    description: {
        type: String,
        required: [true, "Description is required"], // Required validation
        minlength: [10, "Description must be at least 10 characters long"],
    },
    ratings: {
        type: [Number],
        required: [false, "Ratings are not required"], // Optional field },
    },
    reviews: {
        type: [String],
        required: [false, "Reviews are not required"], // Optional
    },
    image: {
        type: String,
        validate: {
            validator: function (v) {
                // Optional: Custom validation for URLs
                return /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif))$/.test(v);
            },
            message: (props) => `${props.value} is not a valid image URL!`,
        },
    },
}, {
    timestamps: true
});


const recognizeProduct = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Image file is required' });
        }

        const prediction = await classifyImage(req.file.buffer);

        // Use regex for a partial match or a library like Fuse.js for fuzzy matching
        const product = await Product.findOne({ name: { $regex: new RegExp(prediction.label, 'i') } });

        if (!product) {
            return res.status(404).json({ message: 'No matching product found' });
        }

        res.status(200).json({ prediction, product });
    } catch (error) {
        res.status(500).json({ message: `Error recognizing product: ${error.message}` });
    }
};
const getProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query; // Default values
        const products = await Product.find()
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
        
        const count = await Product.countDocuments();

        res.status(200).json({
            products,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        });
    } catch (error) {
        res.status(500).json({ message: `Failed to fetch products: ${error.message}`});
    }
};
const getProduct = async (req, res) => {
    /**
     * Fetches a single product by ID.
     * @param {Object} req - Express request object (expects `req.params.id`).
     * @param {Object} res - Express response object.
     * @returns {JSON} - The product object or an error message.
     */
    try{
        const { id } = req.params;
        const product = await Product.findById(id);
        res.status(200).json(product);
    } catch(error){
        res.status(500).json({ message: `Failed to fetch product with ID ${id}: ${error.message}` });
    }};
const createProduct = async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.entries(error.errors).reduce((acc, [key, err]) => {
                acc[key] = err.message;
                return acc;
            }, {});
            return res.status(400).json({ errors });
        }
        res.status(500).json({ message: `Failed to fetch product ${error.message}` });
    }
};  
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Update the product and ensure validators run with `{ runValidators: true }`
        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json(updatedProduct);  // Return only the updated product
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteProduct = async (req, res) => {try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
        return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(deletedProduct);
} catch (error) {
    res.status(500).json({ message: error.message });
}
};
const searchProducts = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const products = await Product.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },        // Case-insensitive match for name
                { description: { $regex: query, $options: 'i' } }, // Case-insensitive match for description
                { reviews: { $regex: query, $options: 'i' } },     // Case-insensitive match for reviews
            ],
        });

        if (products.length === 0) {
            return res.status(404).json({ message: "No products found matching the search query." });
        }

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: `Failed to search products: ${error.message}` });
    }
};


module.exports = {
    getProducts,
    getProduct,
    createProduct,
    updateProduct, 
    deleteProduct,
    recognizeProduct,
    searchProducts,
};

