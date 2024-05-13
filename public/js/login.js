document.addEventListener("DOMContentLoaded", () => {
	const loggedIn = localStorage.getItem("loggedIn");

	// Handle registration response
	document.body.addEventListener("htmx:afterSwap", (event) => {
		const registerFormComponent = document.getElementById(
			"register-form-component",
		);
		const modal = document.getElementById("modal-response");

		if (registerFormComponent?.contains(event.target)) {
			const alertSuccess = registerFormComponent.querySelector(".modal");
			if (alertSuccess) {
				modal.showModal();
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
