// Initiate the message to display on the verify email page
document.addEventListener("DOMContentLoaded", () => {
	const urlParams = new URLSearchParams(window.location.search);
	const successHtml = urlParams.get("message");

	if (successHtml) {
		const targetElement = document.getElementById("verification-response");
		targetElement.innerHTML = decodeURIComponent(successHtml);

		// Remove the element after 3 seconds (adjust the delay as needed)
		removeElementAfterDelay("modal-verification-response", 3000);
	}
});

function removeElementAfterDelay(elementId, delay) {
	setTimeout(() => {
		const element = document.getElementById(elementId);
		if (element) {
			element.remove();
		}
	}, delay);
}
