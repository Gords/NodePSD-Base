document.addEventListener('DOMContentLoaded', function () {
  const loggedIn = localStorage.getItem('loggedIn');
  const registerButton = document.querySelector('#registerButton');
  const loginButton = document.querySelector('#loginButton');
  const logoutButton = document.querySelector('#logoutButton');

  function updateUI() {
    if (loggedIn === 'true') {
      if (registerButton) registerButton.style.display = 'none';
      if (loginButton) loginButton.style.display = 'none';
      if (logoutButton) logoutButton.style.display = 'inline-flex';
    } else {
      if (registerButton) registerButton.style.display = 'inline-flex';
      if (loginButton) loginButton.style.display = 'inline-flex';
      if (logoutButton) logoutButton.style.display = 'none';
    }
  }

  updateUI();

// Handle registration response
document.body.addEventListener('htmx:afterSwap', function (event) {
  const registerResponseContent = document.querySelector('#register-content #register-response');
  if (registerResponseContent && registerResponseContent.contains(event.detail.elt)) {
    const response = event.detail.xhr.response;
    const data = JSON.parse(response);

    if (data.success) {
      registerResponseContent.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
    } else {
      registerResponseContent.innerHTML = `<div class="alert alert-error">${data.message}</div>`;
      console.error('Registration failed:', data.message);
    }
  }
});

  // Handle login response
  document.body.addEventListener('htmx:afterSwap', function (event) {
    const loginResponseContent = document.querySelector('#login-content #login-response');
    if (loginResponseContent && loginResponseContent.contains(event.detail.elt)) {
      const successMessage = event.detail.elt.querySelector('.alert-success');
      const errorMessage = event.detail.elt.querySelector('.alert-error');
      if (successMessage) {
        // Login successful, update UI and set loggedIn flag
        localStorage.setItem('loggedIn', 'true');
        updateUI();
        loginResponseContent.innerHTML = successMessage.outerHTML;
      } else if (errorMessage) {
        // Login failed, display error message
        loginResponseContent.innerHTML = errorMessage.outerHTML;
        console.error('Login failed:', errorMessage.textContent);
      }
    }
  });
});

// Logout function
function logout() {
  localStorage.removeItem('loggedIn');
  window.location.reload();
}

// Attach the logout function to the window object
window.logout = logout;