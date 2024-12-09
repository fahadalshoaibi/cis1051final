require('dotenv').config();

const express = require('express');
const app = express();
const connectDB = require('./config/db.config.js');
const cors = require('cors');
const productRoute = require('./routes/product.route.js');
const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
          cb(null, true);
      } else {
          cb(new Error('Only image files are allowed!'), false);
      }
  },
});

const imageRoutes = require('./routes/imageRoutes');          // For classification
const detectRoutes = require('./routes/detectRoutes');        // For object detection
const { detectObjects } = require('./services/tensorflow.service');

app.post('/api/detect', upload.single('image'), async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).send('No image file uploaded');
        }

        const predictions = await detectObjects(req.file.buffer);

        res.json({ message: 'Object detection successful', predictions });
    } catch (error) {
        console.error('Error in detection route:', error);
        res.status(500).send('Failed to process the image');
    }
});

app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const imageBuffer = req.file.buffer;

        // Call the AI function to analyze the image
        const labels = await analyzeImage(imageBuffer);

        res.status(200).json({ labels });
    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Database Connection
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));

// Routes
app.use('/api/products', productRoute);
app.use('/api/images', imageRoutes);  // Routes for classification
app.use('/api', detectRoutes);       // Routes for detection

app.get('/', (req, res) => {
  res.send("Welcome to the backend");
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({ message: err.message });
  } else if (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start the Server
const PORT = process.env.PORT || 5173;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});