// Form submission logic
function handleSubscribeForm() {
    const form = document.getElementById("subscribeForm");
    const input = document.getElementById("subscribeEmail");

    if (form && input) {
        form.addEventListener("submit", function (event) {
            event.preventDefault(); // Prevent form submission and page refresh

            const email = input.value.trim();

            // Check if the email input is empty
            if (email === "") {
                alert("Please enter your email address.");
                return;
            }

            // Regular expression for email validation
            const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            
            if (!emailPattern.test(email)) {
                alert("Please enter a valid email address.");
                return;
            }

            // Success message
            alert("Thank you for subscribing!");
            form.reset(); // Clear the input field
        });
    }
}

// Fetch and load subscribe section
document.addEventListener("DOMContentLoaded", function () {
    fetch("/subscribe.html") // Adjust path based on your server setup
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.text();
        })
        .then(data => {
            const subscribeDiv = document.getElementById("subscribe");
            if (subscribeDiv) {
                subscribeDiv.innerHTML = data;
                // After loading, attach the form handler
                handleSubscribeForm();
            } else {
                console.error("Element with id 'subscribe' not found.");
            }
        })
        .catch(error => console.error("Error loading subscribe section:", error));
});