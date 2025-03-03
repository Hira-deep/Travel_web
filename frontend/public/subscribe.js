
document.addEventListener("DOMContentLoaded", function () {
    fetch("/components/subscribe.html") // Use absolute path
        .then(response => response.text())
        .then(data => {
            document.getElementById("subscribe").innerHTML = data;
        })
        .catch(error => console.error("Error loading header:", error));
});
