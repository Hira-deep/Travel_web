const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
require("dotenv").config();

const User = require("../models/user");
const Location = require("../models/location");

const router = express.Router();

// Load API keys
const GEOAPIFY_AUTOCOMPLETE_KEY = process.env.GEOAPIFY_AUTOCOMPLETE_KEY;
const GEOAPIFY_PLACES_DETAILS_KEY = process.env.GEOAPIFY_PLACES_DETAILS_KEY;
const GEOAPIFY_PLACES_KEY = process.env.GEOAPIFY_PLACES_KEY;


// Register User
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });

        await newUser.save();
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET);
        res.json({ message: "Registration successful", token });
    } catch (error) {
        res.status(400).json({ error: "Error registering user" });
    }
});

// Login User
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ error: "Server error during login" });
    }
});

// User Profile (Protected)
router.get("/profile", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ error: "Not authorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        res.json({ user });
    } catch (error) {
        res.status(400).json({ error: "Invalid token" });
    }
});

// Autocomplete Search API
router.get("/autocomplete", async (req, res) => {
    try {
        const { q } = req.query;
        const response = await axios.get(
            `https://api.geoapify.com/v1/geocode/autocomplete?text=${q}&apiKey=${GEOAPIFY_AUTOCOMPLETE_KEY}`
        );

        res.json(response.data);
    } catch (error) {
        console.error("Error fetching autocomplete:", error.message);
        res.status(500).json({ error: "Failed to fetch autocomplete results" });
    }
});

// Fetch Place Details (Geoapify + Wikipedia)
router.get("/place-details", async (req, res) => {
    try {
        const { place_id } = req.query;
        if (!place_id) return res.status(400).json({ error: "Missing place_id parameter" });

        // Fetch Place Details from Geoapify
        const placeResponse = await axios.get(
            `https://api.geoapify.com/v2/place-details?id=${place_id}&apiKey=${GEOAPIFY_PLACES_DETAILS_KEY}`
        );

        const placeDetails = placeResponse.data;
        if (!placeDetails.features || placeDetails.features.length === 0) {
            return res.status(404).json({ error: "Place not found" });
        }

        const details = placeDetails.features[0].properties;
        const placeName = details.name || details.address_line1 || "Unknown Place";

        // Fetch Wikipedia Image
        let imageUrl = await getWikipediaImage(placeName);

        res.json({
            place_id,
            place_name: placeName,
            address: details.address_line2 || "N/A",
            country: details.country || "N/A",
            rating: details.rank?.confidence || "No Rating",
            image_url: imageUrl,
        });
    } catch (error) {
        console.error("Error fetching place details:", error.message);
        res.status(500).json({ error: "Failed to fetch place details" });
    }
});

// Save Selected Location to MongoDB
router.post("/save-location", async (req, res) => {
    try {
        const { place_id, place_name, address, country, rating, image_url } = req.body;
        const newLocation = new Location({ place_id, place_name, address, country, rating, image_url });

        await newLocation.save();
        res.json({ message: "Location saved successfully" });
    } catch (error) {
        console.error("Error saving location:", error.message);
        res.status(500).json({ error: "Failed to save location" });
    }
});

// Function: Fetch Wikipedia Image
async function getWikipediaImage(placeName) {
    try {
        const wikiResponse = await axios.get(
            `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&pithumbsize=400&titles=${encodeURIComponent(
                placeName
            )}&origin=*`
        );

        const pages = wikiResponse.data.query.pages;
        const firstPage = Object.values(pages)[0];

        if (firstPage && firstPage.thumbnail) {
            return firstPage.thumbnail.source;
        }
        return "https://via.placeholder.com/300"; // Default image
    } catch (error) {
        console.error("Wikipedia Image Fetch Failed:", error.message);
        return "https://via.placeholder.com/300";
    }
}

// Fetch 10 Nearby Places for a Selected Location
router.get("/nearby-places", async (req, res) => {
  try {
      const { lat, lon } = req.query;
      if (!lat || !lon) return res.status(400).json({ error: "Latitude and longitude are required" });

      const response = await axios.get(
          `https://api.geoapify.com/v2/places?categories=commercial,leisure,tourism,catering,accommodation&filter=circle:${lon},${lat},5000&limit=10&apiKey=${GEOAPIFY_PLACES_KEY}`
      );

      res.json(response.data);
  } catch (error) {
      console.error("Error fetching nearby places:", error.message);
      res.status(500).json({ error: "Failed to fetch nearby places" });
  }
});

module.exports = router;
