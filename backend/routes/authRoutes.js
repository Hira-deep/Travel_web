// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require("axios");
require("dotenv").config();

const User = require('../models/user');
const Location = require('../models/location');

// Load API keys from .env
const AUTOCOMPLETE_KEY = process.env.GEOAPIFY_AUTOCOMPLETE_KEY;
const PLACES_DETAILS_KEY = process.env.GEOAPIFY_PLACES_DETAILS_KEY;



const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET);
    res.json({ message: 'Registration successful', token });
  } catch (error) {
    res.status(400).json({ message: 'Error registering user' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'User not found' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  res.json({ message: 'Login successful', token });
});

// Get user profile (protected route)
router.get('/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    res.json({ user });
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
});


// Route: Autocomplete API (Search Suggestions)
router.get("/autocomplete", async (req, res) => {
  try {
    const { q } = req.query;
    const response = await axios.get(
      `https://api.geoapify.com/v1/geocode/autocomplete?text=${q}&apiKey=${AUTOCOMPLETE_KEY}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch autocomplete results" });
  }
});

// Route: Place Details API (Fetch Full Location Info)
router.get("/place-details", async (req, res) => {
  try {
      const { place_id } = req.query;
      const response = await axios.get(
          `https://api.geoapify.com/v2/place-details?id=${place_id}&apiKey=${process.env.GEOAPIFY_PLACES_DETAILS_KEY}`
      );

      console.log("Geoapify API Response:", response.data); // 🔹 Log full response

      // ✅ Ensure `features` exists
      if (response.data && response.data.features && response.data.features.length > 0) {
          res.json(response.data.features[0]); // Send only the first feature
      } else {
          res.status(404).json({ error: "No details found for this place" });
      }
  } catch (error) {
      console.error("Error fetching place details:", error);
      res.status(500).json({ error: "Failed to fetch place details" });
  }
});

// Route: Save Selected Location to MongoDB
router.post("/save-location", async (req, res) => {
  try {
    const { place_id, place_name, address, country, rating, image_url } = req.body;
    const newLocation = new Location({ place_id, place_name, address, country, rating, image_url });
    await newLocation.save();
    res.json({ message: "Location saved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to save location" });
  }
});


console.log("Geoapify Autocomplete Key:", process.env.GEOAPIFY_AUTOCOMPLETE_KEY);
console.log("Geoapify Place Details Key:", process.env.GEOAPIFY_PLACES_DETAILS_KEY);
console.log("MongoDB URI:", process.env.MONGODB_URI);



module.exports = router;
