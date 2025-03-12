const mongoose = require("mongoose");

const itinerarySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null for guest users
    destination: String,
    duration: Number,
    budget: String,
    companions: String,
    details: String
});

module.exports = mongoose.model('Itinerary', itinerarySchema);
