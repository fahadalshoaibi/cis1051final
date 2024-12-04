require('dotenv').config();

const express = require('express');
const app = express();
const connectDB = require('./config/db.config.js');
const cors = require('cors');
const productRoute = require('./routes/product.route.js');

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