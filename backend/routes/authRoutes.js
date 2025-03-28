const express = require("express");
const bcrypt = require("bcryptjs");
const axios = require("axios");
require("dotenv").config();
const path = require("path");

const User = require("../models/user");
const Location = require("../models/location");

const router = express.Router();

// Load API keys
const GEOAPIFY_AUTOCOMPLETE_KEY = process.env.GEOAPIFY_AUTOCOMPLETE_KEY;
const GEOAPIFY_PLACES_DETAILS_KEY = process.env.GEOAPIFY_PLACES_DETAILS_KEY;
const GEOAPIFY_PLACES_KEY = process.env.GEOAPIFY_PLACES_KEY;
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;

// Middleware: Check if User is Authenticated
const authenticateSession = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ message: "Unauthorized: No session found" });
    }
    next();
};

// Register & Start Session
router.post("/register", async (req, res) => {
    const { fullName, username, email, phone, age, password } = req.body;

    try {
        // Additional server-side validation
        if (fullName.length < 2) {
            return res.status(400).json({ error: "Full name must be at least 2 characters" });
        }
        if (username.length < 3 || username.length > 20) {
            return res.status(400).json({ error: "Username must be 3-20 characters" });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }
        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({ error: "Phone number must be 10 digits" });
        }
        if (age < 1 || age > 120) {
            return res.status(400).json({ error: "Invalid age" });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({
                error: existingUser.email === email ? "Email already exists" : "Username already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            fullName,
            username,
            email,
            phone,
            age,
            password: hashedPassword
        });
        await newUser.save();

        req.session.user = {
            id: newUser._id,
            username: newUser.username,
            fullName: newUser.fullName
        };

        res.status(201).json({
            message: "Registration successful",
            user: req.session.user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

// Login & Start Session
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        req.session.user = { id: user._id, username: user.username };
        console.log("Session after login:", req.session.user);

        res.status(200).json({ message: "Login successful", user: req.session.user });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// Logout
router.post("/logout", (req, res) => {
    console.log("Logout route hit");
    if (!req.session) {
        console.log("No session found");
        return res.status(400).json({ message: "No active session" });
    }

    req.session.destroy((err) => {
        if (err) {
            console.error("Session destroy error:", err);
            return res.status(500).json({ message: "Logout failed" });
        }
        res.clearCookie("connect.sid", { path: "/" });
        console.log("Session destroyed, cookie cleared");
        res.json({ message: "Logout successful" });
    });
});

// Get Profile (Protected)
router.get("/profile", async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ message: "Unauthorized: No session found" });
    }

    try {
        const user = await User.findById(req.session.user.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// Session Debug Routes
router.get("/session-debug", (req, res) => {
    console.log("Session Debug:", req.session);
    res.json({ session: req.session });
});

router.get("/session", (req, res) => {
    if (req.session.user) {
        res.json({ isAuthenticated: true, user: req.session.user });
    } else {
        res.json({ isAuthenticated: false });
    }
});

// Autocomplete Search API
router.get("/autocomplete", async (req, res) => {
    try {
        const { q, category, lat, lon } = req.query;

        // Map frontend categories to Geoapify categories
        const categoryMap = {
            "Restaurants": "catering.restaurant",
            "Hotels": "accommodation.hotel",
            "Cafe": "catering.cafe"
        };

        const geoapifyCategory = categoryMap[category] || "";
        let apiUrl = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(q)}&apiKey=${GEOAPIFY_AUTOCOMPLETE_KEY}`;

        if (geoapifyCategory) {
            apiUrl += `&filter=category:${geoapifyCategory}`;
        }
        if (lat && lon) {
            apiUrl += `&filter=circle:${lon},${lat},5000`; // 5km radius
        }

        const response = await axios.get(apiUrl);
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

        const placeResponse = await axios.get(
            `https://api.geoapify.com/v2/place-details?id=${place_id}&apiKey=${GEOAPIFY_PLACES_DETAILS_KEY}`
        );

        const placeDetails = placeResponse.data;
        if (!placeDetails.features || placeDetails.features.length === 0) {
            return res.status(404).json({ error: "Place not found" });
        }

        const details = placeDetails.features[0].properties;
        const placeName = details.name || details.address_line1 || "Unknown Place";

        let imageUrl = await getPlaceImage(placeName);

        res.json({
            place_id,
            place_name: placeName,
            address: details.address_line2 || "N/A",
            country: details.country || "N/A",
            rating: details.rank?.confidence || "No Rating",
            image_url: imageUrl || "../assets/default.jpg"
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

// Function: Fetch Image from Wikipedia or Pixabay
async function getPlaceImage(placeName) {
    try {
        // 1️⃣ Fetch from Wikipedia
        const wikiResponse = await axios.get(
            `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&pithumbsize=400&titles=${encodeURIComponent(placeName)}&origin=*`
        );

        const pages = wikiResponse.data.query.pages;
        const firstPage = Object.values(pages)[0];

        if (firstPage && firstPage.thumbnail) {
            return firstPage.thumbnail.source;
        }

        // 2️⃣ Fetch from Pixabay (if Wikipedia fails)
        const pixabayResponse = await axios.get(
            `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(placeName)}&image_type=photo&per_page=1`
        );

        if (pixabayResponse.data.hits && pixabayResponse.data.hits.length > 0) {
            return pixabayResponse.data.hits[0].webformatURL;
        }
    } catch (error) {
        console.error(`Image Fetch Failed for ${placeName}:`, error.message);
    }

    return "../assets/default.jpg"; // Match frontend default
}

// Fetch 10 Nearby Places for a Selected Location
router.get("/nearby-places", async (req, res) => {
    try {
        const { lat, lon, category } = req.query;
        if (!lat || !lon) return res.status(400).json({ error: "Latitude and longitude are required" });

        // Map frontend categories to Geoapify categories
        const categoryMap = {
            "Restaurants": "catering.restaurant",
            "Hotels": "accommodation.hotel",
            "Cafe": "catering.cafe"
        };

        const geoapifyCategory = categoryMap[category] || "";
        let apiUrl = `https://api.geoapify.com/v2/places?filter=circle:${lon},${lat},5000&limit=10&apiKey=${GEOAPIFY_PLACES_KEY}`;

        if (geoapifyCategory) {
            apiUrl += `&categories=${geoapifyCategory}`;
        } else {
            // Default categories if none specified
            apiUrl += `&categories=commercial,leisure,tourism,catering,accommodation`;
        }

        const response = await axios.get(apiUrl);
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching nearby places:", error.message);
        res.status(500).json({ error: "Failed to fetch nearby places" });
    }
});

module.exports = router;