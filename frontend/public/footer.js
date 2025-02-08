
document.addEventListener("DOMContentLoaded", function () {
    fetch("/components/footer.html") // Use absolute path
        .then(response => response.text())
        .then(data => {
            document.getElementById("footer").innerHTML = data;
        })
        .catch(error => console.error("Error loading header:", error));
});
