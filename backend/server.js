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

// Import Routes
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookings");
const itineraryRoutes = require("./routes/itineraryRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

// Middleware to parse JSON data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000", // Update this if frontend runs on a different port
    credentials: true
}));

// Session Middleware (Moved Before Routes)
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions'
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 Day
    secure: false, 
    httpOnly: true
}));

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};
connectDB();

// Middleware to Set Guest User if Not Logged In
app.use((req, res, next) => {
    if (!req.session.user || req.session.user.id === undefined) {
        req.session.user = { id: "guest", username: "Guest" };
    }
    next();
});

// Mount Routes (After Session Middleware)
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api", itineraryRoutes);
app.use("/api", paymentRoutes);

// Serve Static Files
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use('/assets', express.static(path.join(__dirname, '../frontend/assets')));
app.use('/components', express.static(path.join(__dirname, "../frontend/components")));

// Serve HTML Pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../frontend/public/login.html')));
app.get('/destinations.html', (req, res) => res.sendFile(path.join(__dirname, '../frontend/public/destinations.html')));
app.get('/login.html', (req, res) => res.sendFile(path.join(__dirname, '../frontend/public/login.html')));
app.get('/register.html', (req, res) => res.sendFile(path.join(__dirname, '../frontend/public/register.html')));
app.get('/result_trip.html', (req, res) => res.sendFile(path.join(__dirname, '../frontend/public/result_trip.html')));
app.get('/home.html', (req, res) => res.sendFile(path.join(__dirname, '../frontend/public/home.html')));

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
