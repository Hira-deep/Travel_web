const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  place_id: String,
  place_name: String,
  address: String,
  country: String,
  rating: Number,
  image_url: String,
});

const Location = mongoose.model("Location", locationSchema);

module.exports = Location;
