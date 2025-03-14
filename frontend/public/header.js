document.addEventListener("DOMContentLoaded", function () {
    fetch("header.html") // Use absolute or relative path
        .then(response => {
            console.log(response);  // Log response object to see the status
            return response.text();
        })
        .then(data => {
            document.getElementById("header-container").innerHTML = data;
        })
        .catch(error => {
            console.error("Error loading header:", error);
        });
});
