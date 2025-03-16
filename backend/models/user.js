const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    fullName: { 
        type: String, 
        required: true,
        minlength: 2 
    },
    username: { 
        type: String, 
        required: true,
        minlength: 3,
        maxlength: 20 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
    },
    phone: { 
        type: String, 
        required: true,
        match: /^\d{10}$/ 
    },
    age: { 
        type: Number, 
        required: true,
        min: 1,
        max: 120 
    },
    password: { 
        type: String, 
        required: true,
        minlength: 6 
    },
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);