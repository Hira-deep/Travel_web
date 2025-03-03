
document.addEventListener("DOMContentLoaded", function () {
    fetch("/components/services.html") // Use absolute path
        .then(response => response.text())
        .then(data => {
            document.getElementById("services").innerHTML = data;
        })
        .catch(error => console.error("Error loading header:", error));
});
