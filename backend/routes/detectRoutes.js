const express = require('express');
const multer = require('multer');
const { detectObjects } = require('../services/tensorflow.service');

const router = express.Router();
const upload = multer(); // Middleware to handle file uploads

router.post('/detect', upload.single('image'), async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        const predictions = await detectObjects(req.file.buffer);
        res.json({ message: 'Object detection successful', predictions });
    } catch (error) {
        console.error('Error in /api/detect route:', error);
        res.status(500).json({ error: 'Failed to process the image' });
    }
});

module.exports = router;