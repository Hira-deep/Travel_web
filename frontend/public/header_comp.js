const checkLoginStatus = async () => {
    try {
        const response = await fetch("http://localhost:4000/api/auth/session", {
            method: "GET",
            credentials: "include", // Ensures cookies are sent
        });

        if (!response.ok) {
            throw new Error("Failed to fetch session data");
        }

        const data = await response.json();
        console.log("Session Data:", data); // Debugging

        const guestNavbar = document.getElementById("guest-navbar");
        const userNavbar = document.getElementById("user-navbar");

        if (data.isAuthenticated) {
            guestNavbar.style.display = "none";
            userNavbar.style.display = "flex";

            // Add event listener only if user is authenticated
            document.getElementById("logout-btn").addEventListener("click", handleLogout);
        } else {
            guestNavbar.style.display = "flex";
            userNavbar.style.display = "none";
        }
    } catch (error) {
        console.error("Error checking login status:", error);
        document.getElementById("guest-navbar").style.display = "flex";
        document.getElementById("user-navbar").style.display = "none";
    }
};

// Ensure this runs when the page loads
document.addEventListener("DOMContentLoaded", checkLoginStatus);


const handleLogout = async () => {
    try {
        await fetch("http://localhost:4000/api/auth/logout", {
            method: "POST",
            credentials: "include",
        });

        checkLoginStatus(); // Refresh navbar state after logout
        window.location.href = "/login.html"; // Redirect to login page
    } catch (error) {
        console.error("Logout error:", error);
    }
};

// Toggle dropdown menu for the user navbar
const toggleDropdown = () => {
    const dropdownMenu = document.getElementById("dropdown-menu");
    dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
};

// Ensure dropdown menu toggle works
document.addEventListener("DOMContentLoaded", () => {
    checkLoginStatus();
    document.getElementById("menu-icon").addEventListener("click", toggleDropdown);
});
