const express = require("express");
const router = express.Router();
const axios = require("axios");
const Itinerary = require("../models/itinerary");
require("dotenv").config();

// Generate itinerary
router.post('/generate-itinerary', async (req, res) => {
    console.log('Received request body:', req.body);
    console.log('Session data:', req.session); 

    if (!req.session) {
        return res.status(500).json({ success: false, error: "Session not initialized" });
    }

    // Ensure userId is valid
    let userId = req.session.userId;
    if (!userId || userId === "guest") {
        userId = null; // Prevents MongoDB ObjectId error
    }

    const { destination, duration, budget, companions } = req.body;

    if (!destination || !duration || !budget || !companions) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    try {
        console.log("Generating itinerary...");
        const itineraryDetails = await generateItinerary(destination, duration, budget, companions);

        console.log("Saving to database...");
        const itinerary = new Itinerary({
            userId, 
            destination,
            duration: parseInt(duration), 
            budget,
            companions,
            details: itineraryDetails
        });

        const savedItinerary = await itinerary.save();
        console.log("Itinerary saved:", savedItinerary._id);

        res.json({ success: true, itinerary: itineraryDetails, itineraryId: savedItinerary._id });

    } catch (error) {
        console.error("Error generating itinerary:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});


// Fetch single itinerary
router.get('/itinerary/:id', async (req, res) => {
    try {
        const itinerary = await Itinerary.findById(req.params.id);
        if (!itinerary) {
            return res.status(404).json({ error: "Itinerary not found" });
        }
        res.json(itinerary);
    } catch (error) {
        console.error("Error fetching itinerary:", error);
        res.status(500).json({ error: error.message });
    }
});

// Fetch all itineraries
router.get('/itineraries', async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ success: false, error: "User not logged in" });
    }

    try {
        const itineraries = await Itinerary.find({ userId: req.session.userId }).sort({ createdAt: -1 });
        res.json(itineraries);
    } catch (error) {
        console.error("Error fetching itineraries:", error);
        res.status(500).json({ error: error.message });
    }
});

// AI-based itinerary generator function
async function generateItinerary(destination, duration, budget, companions) {
    const prompt = `Generate a detailed travel itinerary for a ${duration}-day trip to ${destination} with a ${budget} budget, traveling with ${companions}. Include daily activities, accommodation suggestions, and dining options.From morning to evening in bullet points place by place`;

    let retries = 3;
    while (retries > 0) {
        try {
            const response = await axios.post(
                "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1",
                { inputs: prompt, parameters: { max_length: 1000, temperature: 0.7 } },
                { headers: { Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`, "Content-Type": "application/json" } }
            );

            if (!response.data || !response.data[0] || !response.data[0].generated_text) {
                throw new Error("Invalid AI response");
            }

            return response.data[0].generated_text;

        } catch (error) {
            console.error("AI API error:", error.message);
            retries--;
            if (retries === 0) {
                throw new Error("AI service unavailable. Please try again later.");
            }
            await new Promise(res => setTimeout(res, 2000)); // Wait 2 sec before retry
        }
    }
}

module.exports = router;
