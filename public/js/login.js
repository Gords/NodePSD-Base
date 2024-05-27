document.addEventListener("DOMContentLoaded", () => {
	document.body.addEventListener("htmx:afterSwap", (event) => {
		const registerResponse = document.getElementById("register-response");

		// Handle registration response
		if (registerResponse?.contains(event.target)) {
			const alertSuccess = registerResponse.querySelector(".success");
			if (alertSuccess) {
				setTimeout(() => {
					window.location.href = "/";
				}, 3000);
			}
		}
		// Handle password reset response¯
		const passwordResetForm = document.getElementById("password-reset-form");
		if (passwordResetForm?.contains(event.target)) {
			const alertSuccess = passwordResetForm.querySelector(".success");
			if (alertSuccess) {
				setTimeout(() => {
					window.location.href = "/";
				}, 3000);
			}
		}
	});
});
