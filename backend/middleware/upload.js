const multer = require('multer');
const path = require('path');

// Configure in-memory storage
const storage = multer.memoryStorage();

// File filter to validate file type
const fileFilter = (req, file, cb) => {
    try {
        const allowedExtensions = ['.jpg', '.jpeg', '.png'];
        const ext = path.extname(file.originalname).toLowerCase();

        if (allowedExtensions.includes(ext)) {
            cb(null, true); // Accept the file
        } else {
            cb(new Error(`Invalid file type: ${ext}. Only .jpg, .jpeg, and .png are allowed.`));
        }
    } catch (err) {
        cb(err);
    }
};

// Initialize multer with storage and file filter
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5 MB
    fileFilter: fileFilter,
});

module.exports = upload;