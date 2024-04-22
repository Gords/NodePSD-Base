// Initiate the message to display on the verify email page
document.addEventListener("DOMContentLoaded", () => {
	const urlParams = new URLSearchParams(window.location.search);
	const message = urlParams.get("message");
	if (message) {
		const mainContent = document.getElementById("main-content");
		const messageElement = document.createElement("div");
		messageElement.className = "alert alert-success";
		messageElement.textContent = message;
		mainContent.prepend(messageElement);
	}
});
