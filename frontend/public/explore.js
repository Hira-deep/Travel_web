
document.addEventListener("DOMContentLoaded", function () {
    fetch("/components/explore.html") // Use absolute path
        .then(response => response.text())
        .then(data => {
            document.getElementById("explore-page").innerHTML = data;
        })
        .catch(error => console.error("Error loading header:", error));
});
