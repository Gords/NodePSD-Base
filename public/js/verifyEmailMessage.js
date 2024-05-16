// Initiate the message to display on the verify email page
document.addEventListener("DOMContentLoaded", () => {
	const urlParams = new URLSearchParams(window.location.search);
	const successHtml = urlParams.get("message");

	if (successHtml) {
		const targetElement = document.getElementById("verification-response");
		targetElement.innerHTML = decodeURIComponent(successHtml);
	}
});
