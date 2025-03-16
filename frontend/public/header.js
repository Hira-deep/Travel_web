console.log("Script running");

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded");

    // Fetch and insert header.html
    fetch("header.html")
        .then(response => {
            console.log("Fetch response:", response);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            const headerContainer = document.getElementById("header-container");
            if (!headerContainer) {
                console.error("header-container not found");
                return;
            }
            headerContainer.innerHTML = data;
            console.log("Header loaded into DOM");

            // Now that header is loaded, look for logout button
            const logoutBtn = document.getElementById("logout-btn");
            if (!logoutBtn) {
                console.error("Logout button not found");
                console.log("Current DOM:", document.body.innerHTML);
                return;
            }

            console.log("Logout button found:", logoutBtn);

            logoutBtn.addEventListener("click", async () => {
                console.log("Logout clicked");
                try {
                    const response = await fetch("http://localhost:4000/api/auth/logout", {
                        method: "POST",
                        credentials: "include",
                    });
                    const data = await response.json();
                    console.log("Server response:", data);
                    if (response.ok) {
                        window.location.href = "/login.html";
                    } else {
                        console.error("Logout failed on server:", data.message);
                    }
                } catch (error) {
                    console.error("Fetch error:", error);
                }
            });
        })
        .catch(error => {
            console.error("Error loading header:", error);
        });
});