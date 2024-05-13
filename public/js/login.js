document.addEventListener("DOMContentLoaded", () => {
	const loggedIn = localStorage.getItem("loggedIn");

	// Handle registration response
	document.body.addEventListener("htmx:afterSwap", (event) => {
		const registerFormComponent = document.getElementById(
			"register-form-component",
		);
		if (registerFormComponent?.contains(event.target)) {
			const alertSuccess =
				registerFormComponent.querySelector(".alert-success");
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
