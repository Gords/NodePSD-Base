document.addEventListener("DOMContentLoaded", () => {
	// Handle registration response
	document.body.addEventListener("htmx:afterSwap", (event) => {
	  const registerFormComponent = document.getElementById("register-form-component");
	  if (registerFormComponent?.contains(event.target)) {
		const alertSuccess = registerFormComponent.querySelector(".alert-success");
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
  
	const passwordResetForm = document.getElementById("password-reset-form");
	if (passwordResetForm) {
	  const currentUrl = window.location.href;
	  passwordResetForm.setAttribute("hx-headers", JSON.stringify({ "X-Reset-URL": currentUrl }));
  
	  passwordResetForm.addEventListener("htmx:afterRequest", (event) => {
		const responseDiv = document.getElementById("password-reset-response");
		if (responseDiv.querySelector(".alert-success")) {
		  setTimeout(() => {
			window.location.href = "/";
		  }, 3000);
		}
	  });
	}
  });