const apiUrl = "http://localhost:4000/api/auth";

// Function: Fetch autocomplete suggestions
async function getSuggestions() {
    const query = document.getElementById("searchInput").value;
    const suggestionsList = document.getElementById("suggestionsList");

    if (query.length < 3) {
        suggestionsList.innerHTML = ""; // Clear if query is too short
        return;
    }

    try {
        const response = await fetch(`${apiUrl}/autocomplete?q=${query}`);
        const data = await response.json();

        suggestionsList.innerHTML = ""; // Clear previous results
        suggestionsList.style.display = "block"; // Show dropdown

        if (data.features && data.features.length > 0) {
            data.features.forEach((feature) => {
                const listItem = document.createElement("li");
                listItem.classList.add("list-group-item", "list-group-item-action");
                listItem.textContent = feature.properties.formatted;
                listItem.onclick = () => selectLocation(feature.properties.place_id, feature.properties.formatted, feature.properties.lat, feature.properties.lon);

                suggestionsList.appendChild(listItem);
            });
        } else {
            suggestionsList.innerHTML = `<li class="list-group-item">No results found</li>`;
        }
    } catch (error) {
        console.error("❌ Error fetching suggestions:", error);
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
                image_url: data.image_url || "https://via.placeholder.com/300", // Placeholder image if none provided
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
        const response = await fetch(`${apiUrl}/nearby-places?lat=${lat}&lon=${lon}`);
        const data = await response.json();

        displayNearbyPlaces(data);
    } catch (error) {
        console.error("❌ Error fetching nearby places:", error);
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

    // Limit to 10 places to match the 3-3-3-1 layout
    const places = data.features.slice(0, 10);

    places.forEach((place, index) => {
        const placeCard = `
            <div class="col-md-4">
                <div class="place-card">
                    <img src="${place.image_url || "https://via.placeholder.com/300"}" class="card-img-top img-fluid" alt="${place.properties.name || "Unknown Place"}">
                    <div class="card-body">
                        <h4 class="card-title">${place.properties.name || "Unknown Place"}</h4>
                        <p class="card-text">${place.properties.address_line2 || "N/A"}</p>
                        <p class="rating">${place.properties.rank?.confidence || "Not Rated"}</p>
                        <p class="price">$99 / per person</p>
                        <button class="btn" onclick="navigateToBooking()" >Book Now</button>
                    </div>
                </div>
            </div>
        `;
        nearbyPlacesDiv.innerHTML += placeCard;
    });
}

// Hide dropdown when clicking outside
document.addEventListener("click", function (event) {
    const searchInput = document.getElementById("searchInput");
    const suggestionsList = document.getElementById("suggestionsList");

    if (!searchInput.contains(event.target) && !suggestionsList.contains(event.target)) {
        suggestionsList.style.display = "none"; // Hide dropdown
    }
});

function navigateToBooking() {
    const placeName = document.getElementById("placeName").textContent;
    const placeImage = document.getElementById("placeImage").src;
    const placeAddress = document.getElementById("placeAddress").textContent;
    const placeCountry = document.getElementById("placeCountry").textContent;
    const placeRating = document.getElementById("placeRating").textContent;

    // Encode the data in the URL as query parameters
    const queryParams = new URLSearchParams({
        placeName: placeName,
        placeImage: placeImage,
        placeAddress: placeAddress,
        placeCountry: placeCountry,
        placeRating: placeRating,
        price: "99" // Fixed price
    }).toString();

    // Navigate to the booking page with query parameters
    window.location.href = `booking.html?${queryParams}`;
}