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
      registerResponseContent.innerHTML = `
          <div role="alert" class="alert alert-success max-w-sm mx-auto border-black">
            <img src="./assets/icons/success.svg" alt="Success Symbol" class="w-6 h-6 inline-block">
            <span class="font-bold">${data.message}</span>
          </div>
          `;
              // Delay the redirection by 2 seconds (adjust the delay as needed)
              setTimeout(function() {
                window.location.href = '/';
              }, 2000);
    } else {
      registerResponseContent.innerHTML = `
          <div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
            <img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
            <span class="font-bold justify-center">${data.message}</span>
          </div>
          `;
      console.error('Registration failed:', data.message);
    }
  }
});

  // Handle login response
  document.body.addEventListener('htmx:afterRequest', function (event) {
    if (event.detail.target.id === 'login-form') {
      const response = JSON.parse(event.detail.xhr.response);
      const loginResponseContent = document.querySelector('#login-content #login-response');
      if (response.success) {
        // Login successful, update UI, set loggedIn flag, and redirect after a delay
        localStorage.setItem('loggedIn', 'true');
        updateUI();
        loginResponseContent.innerHTML = `
          <div role="alert" class="alert alert-success max-w-sm mx-auto border-black">
            <img src="./assets/icons/success.svg" alt="Success Symbol" class="w-6 h-6 inline-block">
            <span class="font-bold">${response.message}</span>
          </div>
          `;
        
        // Delay the redirection by 2 seconds (adjust the delay as needed)
        setTimeout(function() {
          window.location.href = '/admin-panel.html';
        }, 2000);
      } else {
        // Login failed, display error message
        updateUI();
        loginResponseContent.innerHTML = `
          <div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
            <img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
            <span class="font-bold text-center">${response.message}</span>
          </div>
          `;
        console.error('Login failed:', response.message);
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