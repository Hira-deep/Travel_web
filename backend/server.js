const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');
const cors = require("cors");
const session = require("express-session");
const MongoStore = require('connect-mongo');

const bodyParser = require('body-parser');

require('dotenv').config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 4000;

const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookings");
const itineraryRoutes = require("./routes/itineraryRoutes");

// Middleware to parse JSON data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.json());
app.use(cors({
    origin: "http://localhost:4000", // Your frontend URL
    credentials: true // Allow session cookies
}));
app.use(itineraryRoutes); // Mount the router


// Move session setup here
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  }));
  

// Serve static files from the frontend/public directory
app.use(express.static(path.join(__dirname, '../frontend/public')));

app.use('/assets', express.static(path.join(__dirname, '../frontend/assets')));

app.use('/components', express.static(path.join(__dirname, "../frontend/components")));

//login and register database
//app.use("/api/auth", authRoutes);

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


// Middleware to set guest user if not logged in
app.use((req, res, next) => {
    if (!req.session.user) {
        req.session.user = { id: 'guest', username: 'Guest' };
    }
    next();
});

// Sample API route (for backend API requests)
app.get('/api/data', (req, res) => {
    res.json({ message: 'Hello from the backend!' });
});

//login and register database
app.use("/api/auth", authRoutes);

//booking routes
app.use("/api/bookings", bookingRoutes);

//itinerary routes
app.use("/api", itineraryRoutes);

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

app.get('/result_trip.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/result_trip.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
