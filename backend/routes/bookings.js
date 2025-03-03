const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");

// Create a new booking
router.post("/", async (req, res) => {
    const { placeName, fullName, phone, date, guests, totalPrice } = req.body;
    try {
        const booking = new Booking({
            placeName,
            fullName,
            phone,
            date,
            guests,
            totalPrice
        });
        await booking.save();

        res.status(201).json({ message: "Booking recorded successfully" });
    } catch (error) {
        console.error("Error recording booking:", error);
        res.status(500).json({ error: "Error recording booking" });
    }
});

module.exports = router;