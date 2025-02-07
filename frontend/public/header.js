document.addEventListener("DOMContentLoaded", function () {
    fetch("/components/header.html") // Use absolute path
        .then(response => response.text())
        .then(data => {
            document.getElementById("header-container").innerHTML = data;
        })
        .catch(error => console.error("Error loading header:", error));
});
