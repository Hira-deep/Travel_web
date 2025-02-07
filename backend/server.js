// server.js
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit the process with failure
    }
};

// Call the connectDB function
connectDB();

// Sample route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});