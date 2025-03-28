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
        document.getElementById("paymentMessage").textContent = "Error fetching booking details.";
        document.getElementById("paymentMessage").className = "text-danger";
    }

    // Validation functions
    function validateCardNumber(cardNumber) {
        // Remove spaces and non-digit characters
        const cleanedCardNumber = cardNumber.replace(/\D/g, '');
        // Check if it's exactly 16 digits
        const isValid = /^\d{16}$/.test(cleanedCardNumber);
        return {
            isValid,
            cleanedValue: cleanedCardNumber,
            error: isValid ? null : "Card number must be exactly 16 digits."
        };
    }

    function validateExpiryDate(expiry) {
        // Expected format: MM/YY (e.g., 03/25 for March 2025)
        const match = expiry.match(/^(\d{2})\/(\d{2})$/);
        if (!match) {
            return { isValid: false, error: "Expiry date must be in MM/YY format." };
        }

        const month = parseInt(match[1], 10);
        const year = parseInt(match[2], 10);
        // Convert YY to YYYY (e.g., 25 to 2025)
        const fullYear = 2000 + year;

        // Validate month (01-12)
        if (month < 1 || month > 12) {
            return { isValid: false, error: "Month must be between 01 and 12." };
        }

        // Current date (March 28, 2025)
        const currentDate = new Date(2025, 2, 28); // Month is 0-based in JavaScript (2 = March)
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // Convert to 1-based month

        // Expiry date as Date object (e.g., 03/25 -> March 1, 2025)
        const expiryDate = new Date(fullYear, month - 1, 1);

        // Check if expiry date is in the past
        if (fullYear < currentYear || (fullYear === currentYear && month < currentMonth)) {
            return { isValid: false, error: "Expiry date cannot be in the past." };
        }

        return { isValid: true, error: null };
    }

    function validateCVV(cvv) {
        // Remove non-digit characters
        const cleanedCVV = cvv.replace(/\D/g, '');
        // Check if it's 1 to 3 digits
        const isValid = /^\d{3,3}$/.test(cleanedCVV);
        return {
            isValid,
            cleanedValue: cleanedCVV,
            error: isValid ? null : "CVV must be 3 digits."
        };
    }

    // Handle payment form submission
    document.getElementById("paymentForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const messageDiv = document.getElementById("paymentMessage");
        messageDiv.textContent = ""; // Clear previous messages

        // Get form inputs
        const cardNumberInput = document.getElementById("cardNumber").value;
        const expiryInput = document.getElementById("expiry").value;
        const cvvInput = document.getElementById("cvv").value;

        // Validate inputs
        const cardNumberValidation = validateCardNumber(cardNumberInput);
        if (!cardNumberValidation.isValid) {
            messageDiv.textContent = cardNumberValidation.error;
            messageDiv.className = "text-danger";
            return;
        }

        const expiryValidation = validateExpiryDate(expiryInput);
        if (!expiryValidation.isValid) {
            messageDiv.textContent = expiryValidation.error;
            messageDiv.className = "text-danger";
            return;
        }

        const cvvValidation = validateCVV(cvvInput);
        if (!cvvValidation.isValid) {
            messageDiv.textContent = cvvValidation.error;
            messageDiv.className = "text-danger";
            return;
        }

        // If all validations pass, proceed with payment
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

            if (response.ok) {
                messageDiv.textContent = "Payment successful! Redirecting...";
                messageDiv.className = "text-success";
                setTimeout(() => window.location.href = "/home.html", 2000);
            } else {
                messageDiv.textContent = result.error || "Payment failed.";
                messageDiv.className = "text-danger";
            }
        } catch (error) {
            console.error("Payment error:", error);
            messageDiv.textContent = "An error occurred during payment.";
            messageDiv.className = "text-danger";
        }
    });
});