// booking.js

// Extract place details from URL query parameters
const urlParams = new URLSearchParams(window.location.search);
const placeName = urlParams.get("placeName");
const placeImage = urlParams.get("placeImage");
const placeAddress = urlParams.get("placeAddress");
const placeCountry = urlParams.get("placeCountry");
const placeRating = urlParams.get("placeRating");
const price = urlParams.get("price") || 8000; // Default to ₹8000 if not provided

// Populate place details
document.getElementById("placeName").textContent = placeName;
document.getElementById("placeImage").src = placeImage;
document.getElementById("placeCity").textContent = placeAddress;
document.getElementById("placeCountry").textContent = placeCountry;
document.getElementById("placeRating").textContent = placeRating;
document.getElementById("placePrice").textContent = price;
document.getElementById("basePrice").textContent = `₹${price}`;
document.getElementById("totalBasePrice").textContent = `₹${price}`;

// GST calculation (18% of base price)
const gstRate = 0.18;
const gstAmount = Math.round(price * gstRate); // ₹1440 for ₹8000
document.getElementById("gstAmount").textContent = `₹${gstAmount}`;
document.getElementById("totalPrice").textContent = `₹${parseInt(price) + gstAmount}`;

// Set minimum date (2 days from current date)
const currentDate = new Date(); // Current date: March 22, 2025
const minDate = new Date(currentDate);
minDate.setDate(currentDate.getDate() + 2); // Add 2 days: March 24, 2025

// Format date to YYYY-MM-DD for the input
const minDateString = minDate.toISOString().split("T")[0];
document.getElementById("date").setAttribute("min", minDateString);

// Update total price based on number of guests
document.getElementById("guests").addEventListener("input", function() {
    const guests = parseInt(this.value) || 1;
    const basePrice = parseInt(price);
    const totalBase = basePrice * guests;
    const totalGst = gstAmount * guests; // GST scales with guests
    const total = totalBase + totalGst;
    document.getElementById("totalBasePrice").textContent = `₹${totalBase}`;
    document.getElementById("totalPrice").textContent = `₹${total}`;
});

// Handle form submission with date validation
document.getElementById("bookingForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const selectedDate = new Date(document.getElementById("date").value);
    if (selectedDate < minDate) {
        alert("Please select a date at least 2 days from today.");
        return;
    }

    const bookingData = {
        placeName: placeName,
        fullName: document.getElementById("fullName").value,
        phone: document.getElementById("phone").value,
        date: document.getElementById("date").value,
        guests: parseInt(document.getElementById("guests").value),
        totalPrice: parseInt(document.getElementById("totalPrice").textContent.replace("₹", ""))
    };

    try {
        const response = await fetch("http://localhost:4000/api/bookings/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bookingData),
            credentials: "include" // Include cookies for session
        });

        const result = await response.json();
        if (response.ok) {
            alert("Booking successfully recorded! Proceeding to payment...");
            window.location.href = `/payment.html?bookingId=${result.bookingId}`; // Redirect to payment
        } else {
            alert("Error recording booking. Please try again.");
        }
    } catch (error) {
        console.error("Error submitting booking:", error);
        alert("Error recording booking. Please try again.");
    }
});