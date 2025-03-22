
document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get("bookingId");

    // Fetch booking details
    try {
        const response = await fetch(`http://localhost:4000/api/bookings/${bookingId}`, {
            method: "GET",
            credentials: "include"
        });
        const booking = await response.json();
        document.getElementById("placeName").textContent = booking.placeName;
        document.getElementById("totalAmount").textContent = booking.totalPrice;
    } catch (error) {
        console.error("Error fetching booking:", error);
    }

    // Handle payment form submission
    document.getElementById("paymentForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const paymentData = {
            bookingId,
            amount: parseInt(document.getElementById("totalAmount").textContent),
            paymentMethod: "credit_card" // Mock payment method
        };

        try {
            const response = await fetch("http://localhost:4000/api/payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(paymentData),
                credentials: "include"
            });

            const result = await response.json();
            const messageDiv = document.getElementById("paymentMessage");

            if (response.ok) {
                messageDiv.textContent = "Payment successful! Redirecting...";
                messageDiv.className = "success";
                setTimeout(() => window.location.href = "/home.html", 2000);
            } else {
                messageDiv.textContent = result.error || "Payment failed.";
                messageDiv.className = "error";
            }
        } catch (error) {
            console.error("Payment error:", error);
            document.getElementById("paymentMessage").textContent = "An error occurred.";
            document.getElementById("paymentMessage").className = "error";
        }
    });
});