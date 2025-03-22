// routes/payment.js
const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const Payment = require("../models/payment");

// GET payment page with booking details
router.get("/payment/:bookingId", async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId);
        if (!booking) return res.status(404).json({ error: "Booking not found" });
        res.sendFile("payment.html", { root: "public" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// POST payment processing
router.post("/payments", async (req, res) => {
    const { bookingId, amount, paymentMethod } = req.body;

    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ error: "Booking not found" });

        const payment = new Payment({
            bookingId,
            amount,
            paymentMethod,
            status: "completed" // Mocking a successful payment
        });
        await payment.save();

        res.status(200).json({ message: "Payment successful", paymentId: payment._id });
    } catch (error) {
        console.error("Payment error:", error);
        res.status(500).json({ error: "Payment failed" });
    }
});

module.exports = router;