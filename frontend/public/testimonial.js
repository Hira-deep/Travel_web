
document.addEventListener("DOMContentLoaded", function () {
    fetch("/components/testimonial.html") // Use absolute path
        .then(response => response.text())
        .then(data => {
            document.getElementById("testimonial").innerHTML = data;
        })
        .catch(error => console.error("Error loading header:", error));
});
