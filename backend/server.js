const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require("cors");
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 4000;

const authRoutes = require("./routes/authRoutes");

// Middleware to parse JSON data
app.use(express.json());
app.use(cors());


// Serve static files from the frontend/public directory
app.use(express.static(path.join(__dirname, '../frontend/public')));

app.use('/assets', express.static(path.join(__dirname, '../frontend/assets')));

app.use('/components', express.static(path.join(__dirname, "../frontend/components")));

//login and register database
app.use("/api/auth", authRoutes);

// Serve index.html at the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
           // useNewUrlParser: true,
           // useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit the process with failure
    }
};

// Call the connectDB function
connectDB();

// Sample API route (for backend API requests)
app.get('/api/data', (req, res) => {
    res.json({ message: 'Hello from the backend!' });
});

// Serve other pages directly (like destinations.html, login.html)
app.get('/destinations.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/destinations.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/login.html'));
});

app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/register.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
