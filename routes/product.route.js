const express = require('express');
const multer = require('multer');
const upload = require('../middleware/upload');
const router = express.Router();
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    recognizeProduct,
} = require('../controller/product.controller.js');

// Middleware for validating product data
const validateProduct = (req, res, next) => {
    const requiredFields = ['name', 'price', 'quantity', 'description'];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
        return res.status(400).json({
            message: `Missing required fields: ${missingFields.join(', ')}`,
        });
    }

    next();
};

// Fetch all products (supports pagination)
router.get('/', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    try {
        const products = await getProducts({ page, limit });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Fetch a single product by ID
router.get('/:id', getProduct);

// Create a new product
router.post('/', validateProduct, createProduct);

// Classify a single uploaded image
router.post(
    '/recognize',
    upload.single('image'),
    (err, req, res, next) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: err.message });
        } else if (err) {
            return res.status(500).json({ message: `Upload error: ${err.message}` });
        }
        next();
    },
    recognizeProduct
);

// Upload multiple images
router.post(
    '/upload',
    upload.array('images', 10),
    (err, req, res, next) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: err.message });
        } else if (err) {
            return res.status(500).json({ message: `Upload error: ${err.message}` });
        }
        next();
    },
    (req, res) => {
        res.status(200).json({
            message: `${req.files.length} files uploaded successfully!`,
            files: req.files.map((file) => file.originalname),
        });
    }
);

// Update a product by ID
router.put('/:id', updateProduct);

// Delete a product by ID
router.delete('/:id', deleteProduct);

// Catch-all for undefined routes
router.use('*', (req, res) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

module.exports = router;