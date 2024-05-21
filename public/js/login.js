document.addEventListener("DOMContentLoaded", () => {
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
	});
});
