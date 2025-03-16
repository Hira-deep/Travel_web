// routes/bookings.js
const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (!req.session || !req.session.user || !req.session.user.id) {
        return res.status(401).json({ error: "Please login to perform this action" });
    }
    next();
};

// Create a new booking
router.post("/", isAuthenticated, async (req, res) => {
    const { placeName, fullName, phone, date, guests, totalPrice } = req.body;

    if (!placeName || !fullName || !phone || !date || !guests || !totalPrice) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const booking = new Booking({
            user: req.session.user.id, // Use the user ID from session
            placeName,
            fullName,
            phone,
            date,
            guests,
            totalPrice
        });
        await booking.save();
        res.status(201).json({ message: "Booking recorded successfully", booking });
    } catch (error) {
        console.error("Error recording booking:", error);
        res.status(500).json({ error: "Error recording booking" });
    }
});

// Get all bookings for logged-in user
router.get("/", isAuthenticated, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.session.user.id });
        res.status(200).json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ error: "Error fetching bookings" });
    }
});

// Get single booking
router.get("/:id", isAuthenticated, async (req, res) => {
    try {
        const booking = await Booking.findOne({ 
            _id: req.params.id, 
            user: req.session.user.id 
        });
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }
        res.status(200).json(booking);
    } catch (error) {
        console.error("Error fetching booking:", error);
        res.status(500).json({ error: "Error fetching booking" });
    }
});

// Update a booking
router.put("/:id", isAuthenticated, async (req, res) => {
    try {
        const booking = await Booking.findOne({ 
            _id: req.params.id, 
            user: req.session.user.id 
        });

        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        const updates = req.body;
        Object.assign(booking, updates);
        await booking.save();
        
        res.status(200).json({ message: "Booking updated successfully", booking });
    } catch (error) {
        console.error("Error updating booking:", error);
        res.status(500).json({ error: "Error updating booking" });
    }
});

// Delete a booking
router.delete("/:id", isAuthenticated, async (req, res) => {
    try {
        const booking = await Booking.findOneAndDelete({ 
            _id: req.params.id, 
            user: req.session.user.id 
        });

        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        res.status(200).json({ message: "Booking deleted successfully" });
    } catch (error) {
        console.error("Error deleting booking:", error);
        res.status(500).json({ error: "Error deleting booking" });
    }
});

module.exports = router;