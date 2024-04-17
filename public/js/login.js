document.addEventListener('DOMContentLoaded', function () {
  const loggedIn = localStorage.getItem('loggedIn');

  // Handle registration response
  document.body.addEventListener('htmx:afterSwap', function (event) {
    const registerResponseContent = document.querySelector('#register-content #register-response');
    if (registerResponseContent && registerResponseContent.contains(event.detail.elt)) {
      const response = event.detail.xhr.response;

      if (response.includes('alert-success')) {
        // Registration successful, redirect after a delay
        setTimeout(function() {
          window.location.href = '/';
        }, 2000);
      } else if (response.includes('alert-error')) {
        // Registration failed, display error message
        registerResponseContent.innerHTML = response;
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