const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
    place_id: { type: String, required: true, unique: true },
    place_name: { type: String, required: true },
    address: { type: String, required: true },
    country: { type: String, required: true },
    rating: { type: String },
    image_url: { type: String }
});

module.exports = mongoose.model("Location", locationSchema);
