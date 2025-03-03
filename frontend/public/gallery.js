
document.addEventListener("DOMContentLoaded", function () {
    fetch("/components/gallery.html") // Use absolute path
        .then(response => response.text())
        .then(data => {
            document.getElementById("gallery").innerHTML = data;
        })
        .catch(error => console.error("Error loading header:", error));
});
