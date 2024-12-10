const express = require('express');
const imageRoutes = require('../routes/imageRoutes'); // Import routes

const app = express();
const PORT = 5173;

// Middleware to parse JSON
app.use(express.json());

// Use image handling routes
app.use('/api/images', imageRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});