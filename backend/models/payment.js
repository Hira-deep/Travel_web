
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    status: { type: String, default: "pending" }, // pending, completed, failed
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Payment", paymentSchema);