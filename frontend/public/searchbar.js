const apiUrl = "http://localhost:4000/api/auth"; // Corrected API URL

// Function: Fetch autocomplete suggestions
async function getSuggestions() {
    const query = document.getElementById("searchInput").value;
    const suggestionsList = document.getElementById("suggestionsList");

    if (query.length < 3) {
        suggestionsList.innerHTML = "";  // Clear if query is too short
        return;
    }

    try {
        const response = await fetch(`${apiUrl}/autocomplete?q=${query}`);
        const data = await response.json();

        suggestionsList.innerHTML = "";  // Clear previous results

        if (data.features && data.features.length > 0) {
            data.features.forEach((feature) => {
                const listItem = document.createElement("li");
                listItem.classList.add("list-group-item", "list-group-item-action");
                listItem.textContent = feature.properties.formatted;
                listItem.onclick = () => selectLocation(feature.properties.place_id, feature.properties.formatted);

                suggestionsList.appendChild(listItem);
            });
        } else {
            suggestionsList.innerHTML = `<li class="list-group-item">No results found</li>`;
        }
    } catch (error) {
        console.error("Error fetching suggestions:", error);
    }
}


// Function: Fetch place details and save to DB
async function selectLocation(placeId, placeName) {
    try {
        const response = await fetch(`${apiUrl}/place-details?place_id=${placeId}`);
        const data = await response.json();

        console.log("API Response:", data); // 🔹 Log the full response

        if (data && data.properties) {
            const details = data.properties;

            const placeData = {
                place_id: placeId,
                place_name: placeName,
                address: details.address_line2 || "N/A",
                country: details.country || "N/A",
                rating: details.rank ? details.rank.confidence : "No Rating",
                image_url: details.image_url || "https://via.placeholder.com/300",
            };

            // Save to database
            await fetch(`${apiUrl}/save-location`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(placeData),
            });

            // Display in UI
            document.getElementById("placeName").textContent = placeData.place_name;
            document.getElementById("placeAddress").textContent = placeData.address;
            document.getElementById("placeCountry").textContent = placeData.country;
            document.getElementById("placeRating").textContent = placeData.rating;
            document.getElementById("placeImage").src = placeData.image_url;
            document.getElementById("placeDetails").classList.remove("d-none");
        } else {
            console.error("Invalid place details response:", data);
        }
    } catch (error) {
        console.error("Error fetching place details:", error);
    }
}

