const apiUrl = "http://localhost:4000/api/auth";

// Function: Fetch autocomplete suggestions
async function getSuggestions() {
    const query = document.getElementById("searchInput").value;
    const suggestionsList = document.getElementById("suggestionsList");

    if (query.length < 2) { // Adjusted to 2 for consistency with earlier code
        suggestionsList.innerHTML = ""; // Clear if query is too short
        return;
    }

    try {
        // Use window.selectedCategory from destinations.html
        const response = await fetch(`${apiUrl}/autocomplete?q=${encodeURIComponent(query)}&category=${encodeURIComponent(window.selectedCategory)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        suggestionsList.innerHTML = ""; // Clear previous results
        suggestionsList.style.display = "block"; // Show dropdown

        if (data.features && data.features.length > 0) {
            data.features.forEach((feature) => {
                const listItem = document.createElement("li");
                listItem.classList.add("list-group-item", "list-group-item-action");
                listItem.textContent = feature.properties.formatted;
                // Use geometry.coordinates for lat/lon to align with Geoapify
                listItem.onclick = () => selectLocation(
                    feature.properties.place_id,
                    feature.properties.formatted,
                    feature.geometry.coordinates[1], // Latitude
                    feature.geometry.coordinates[0]  // Longitude
                );
                suggestionsList.appendChild(listItem);
            });
        } else {
            suggestionsList.innerHTML = `<li class="list-group-item">No results found</li>`;
        }
    } catch (error) {
        console.error("❌ Error fetching suggestions:", error);
        suggestionsList.innerHTML = `<li class="list-group-item">Error loading suggestions</li>`;
    }
}

// Function: Fetch place details and nearby places
async function selectLocation(placeId, placeName, lat, lon) {
    try {
        const response = await fetch(`${apiUrl}/place-details?place_id=${placeId}`);
        const data = await response.json();

        if (data && data.place_id) {
            const placeData = {
                place_id: placeId,
                place_name: placeName,
                address: data.address || "N/A",
                country: data.country || "N/A",
                rating: data.rating || "No Rating",
                image_url: data.image_url || "../assets/default.jpg", // Keep your default image
            };

            // Save to database
            await fetch(`${apiUrl}/save-location`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(placeData),
            });

            // Display exact place details in UI
            document.getElementById("placeName").textContent = placeData.place_name;
            document.getElementById("placeAddress").textContent = placeData.address;
            document.getElementById("placeCountry").textContent = placeData.country;
            document.getElementById("placeRating").textContent = placeData.rating;
            document.getElementById("placeImage").src = placeData.image_url;
            document.getElementById("placeDetails").classList.remove("d-none");

            // Fetch and display nearby places
            fetchNearbyPlaces(lat, lon);
        } else {
            console.error("❌ Invalid place details response:", data);
        }
    } catch (error) {
        console.error("❌ Error fetching place details:", error);
    }
}

// Function: Fetch 10 Nearby Places
async function fetchNearbyPlaces(lat, lon) {
    try {
        // Include category in nearby places fetch
        const response = await fetch(`${apiUrl}/nearby-places?lat=${lat}&lon=${lon}&category=${encodeURIComponent(window.selectedCategory)}`);
        const data = await response.json();

        displayNearbyPlaces(data);
    } catch (error) {
        console.error("❌ Error fetching nearby places:", error);
        document.getElementById("nearbyPlaces").innerHTML = "<p>Error loading nearby places.</p>";
    }
}

// Function: Display Nearby Places in UI
function displayNearbyPlaces(data) {
    const nearbyPlacesDiv = document.getElementById("nearbyPlaces");
    nearbyPlacesDiv.innerHTML = "";

    if (!data.features || data.features.length === 0) {
        nearbyPlacesDiv.innerHTML = "<p>No places found nearby.</p>";
        return;
    }

    // Limit to 10 places
    const places = data.features.slice(0, 10);

    places.forEach((place) => {
        const placeCard = document.createElement("div");
        placeCard.classList.add("col"); // Adjusted to match your row-cols-md-3
        placeCard.innerHTML = `
            <div class="place-card">
                <img src="${place.image_url || '../assets/default.jpg'}" class="card-img-top img-fluid" alt="${place.properties.name || 'Unknown Place'}">
                <div class="card-body">
                    <h4 class="card-title">${place.properties.name || place.properties.formatted.split(',')[0]}</h4>
                    <p class="card-text">${place.properties.address_line2 || place.properties.formatted || 'N/A'}</p>
                    <p class="rating">${place.properties.rank?.confidence || place.properties.rating || 'Not Rated'}</p>
                    <p class="price">₹8000 / per person</p>
                    <button class="btn btn-warning book-now-btn" 
                        data-name="${place.properties.name || place.properties.formatted.split(',')[0]}" 
                        data-image="${place.image_url || '../assets/default.jpg'}" 
                        data-address="${place.properties.address_line2 || place.properties.formatted || 'N/A'}"
                        data-country="${place.properties.country || 'N/A'}"
                        data-rating="${place.properties.rank?.confidence || place.properties.rating || 'No Rating'}">
                        Book Now
                    </button>
                </div>
            </div>
        `;
        nearbyPlacesDiv.appendChild(placeCard);
    });

    // Add event listeners for "Book Now" buttons
    document.querySelectorAll(".book-now-btn").forEach(button => {
        button.addEventListener("click", function () {
            const placeName = this.getAttribute("data-name");
            const placeImage = this.getAttribute("data-image");
            const placeAddress = this.getAttribute("data-address");
            const placeCountry = this.getAttribute("data-country");
            const placeRating = this.getAttribute("data-rating");

            const queryParams = new URLSearchParams({
                placeName: placeName,
                placeImage: placeImage,
                placeAddress: placeAddress,
                placeCountry: placeCountry,
                placeRating: placeRating,
                price: "8000"
            }).toString();

            window.location.href = `booking.html?${queryParams}`;
        });
    });
}