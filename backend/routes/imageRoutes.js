const express = require('express');
const multer = require('multer');
const { classifyImage } = require('../services/tensorflow.service');

const router = express.Router();
const upload = multer(); // Set up multer for handling multipart/form-data

// Endpoint to classify an image
router.post('/classify', upload.single('image'), async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        // Analyze the image using TensorFlow.js
        const result = await classifyImage(req.file.buffer);

        // Send the classification result
        res.json({ message: 'Image classified successfully', result });
    } catch (error) {
        console.error('Error classifying image:', error);
        res.status(500).json({ error: 'Failed to classify image' });
    }
});

module.exports = router;