document.addEventListener("DOMContentLoaded", () => {
	const loggedIn = localStorage.getItem("loggedIn");

	// Handle registration response
	document.body.addEventListener("htmx:afterSwap", (event) => {
		const registerResponse = document.getElementById("register-response");
		if (registerResponse?.contains(event.target)) {
			const alertSuccess = registerResponse.querySelector(".success");
			if (alertSuccess) {
				setTimeout(() => {
					window.location.href = "/";
				}, 3000);
			}
		}
	});

	// Handle successful login state
	document.body.addEventListener("htmx:afterSwap", (event) => {
		const loginSuccessMessage = document.getElementById("login-success");
		if (loginSuccessMessage) {
			localStorage.setItem("loggedIn", true);
		}
	});
});

// Logout function
function logout() {
	localStorage.removeItem("loggedIn");
	window.location.href = "/";
}

// Attach the logout function to the window object
window.logout = logout;

// Check for URL query parameters and render HTML content
window.onload = () => {
	const urlParams = new URLSearchParams(window.location.search);
	const successHtml = urlParams.get("success");
	const errorHtml = urlParams.get("error");

	if (successHtml) {
		const targetElement = document.getElementById("verification-response");
		targetElement.innerHTML = decodeURIComponent(successHtml);
	} else if (errorHtml) {
		const targetElement = document.getElementById("verification-response");
		targetElement.innerHTML = decodeURIComponent(errorHtml);
	}
};
