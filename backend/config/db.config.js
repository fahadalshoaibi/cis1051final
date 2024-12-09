require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
    const uri = process.env.MONGO_URI;

    if (!uri) {
        throw new Error('MONGO_URI is not defined in the environment variables');
    }

    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1); // Exit the process on failure
    }
};

module.exports = connectDB;
/** 
module.exports = {
    url: "mongodb+srv://fahad20032012:smartbird@products.hvj8k.mongodb.net/shop?retryWrites=true&w=majority&appName=products"
  };
*/