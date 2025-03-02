const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    placeName: { type: String, required: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: Date, required: true },
    guests: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Booking", bookingSchema);