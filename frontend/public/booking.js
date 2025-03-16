        // Extract place details from URL query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const placeName = urlParams.get("placeName");
        const placeImage = urlParams.get("placeImage");
        const placeAddress = urlParams.get("placeAddress");
        const placeCountry = urlParams.get("placeCountry");
        const placeRating = urlParams.get("placeRating");
        const price = urlParams.get("price");

        // Populate place details
        document.getElementById("placeName").textContent = placeName;
        document.getElementById("placeImage").src = placeImage;
        document.getElementById("placeCity").textContent = placeAddress;
        document.getElementById("placeCountry").textContent = placeCountry;
        document.getElementById("placeRating").textContent = placeRating;
        document.getElementById("placePrice").textContent = price;
        document.getElementById("basePrice").textContent = `₹${price}`;
        document.getElementById("totalBasePrice").textContent = `₹${price}`;
        document.getElementById("totalPrice").textContent = `₹${parseInt(price) + 150}`; // Add $10 service charge

        // Update total price based on number of guests
        document.getElementById("guests").addEventListener("input", function() {
            const guests = parseInt(this.value) || 1;
            const basePrice = parseInt(price);
            const totalBase = basePrice * guests;
            const total = totalBase + 10; // Add $10 service charge
            document.getElementById("totalBasePrice").textContent = `₹${totalBase}`;
            document.getElementById("totalPrice").textContent = `₹${total}`;
        });

        // Handle form submission
        document.getElementById("bookingForm").addEventListener("submit", async function(e) {
            e.preventDefault();

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

                if (response.ok) {
                    alert("Booking successfully recorded!");
                    window.location.href = "/home.html"; // Redirect to homepage
                } else {
                    alert("Error recording booking. Please try again.");
                }
            } catch (error) {
                console.error("Error submitting booking:", error);
                alert("Error recording booking. Please try again.");
            }
        });
