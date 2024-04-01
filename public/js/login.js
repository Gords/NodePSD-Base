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
              // Delay the redirection by 2 seconds (adjust the delay as needed)
              setTimeout(function() {
                window.location.href = '/';
              }, 2000);
    } else {
      registerResponseContent.innerHTML = `<div class="alert alert-error">${data.message}</div>`;
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
        loginResponseContent.innerHTML = `<div class="alert alert-success">${response.message}</div>`;
        
        // Delay the redirection by 2 seconds (adjust the delay as needed)
        setTimeout(function() {
          window.location.href = '/';
        }, 2000);
      } else {
        // Login failed, display error message
        loginResponseContent.innerHTML = `<div class="alert alert-error">${response.message}</div>`;
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

// Fetch user details
fetch('/check-login').then(response => {
  if (!response.ok) {
    throw new Error('Failed to fetch user data')
  }
  return response.json()
}).then(user => {
  document.getElementById('user-name').textContent = user.name
  document.getElementById('user-email').textContent = user.email

  const usernameInitials = user.name ? user.name.charAt(0).toUpperCase() : ''
  document.getElementById('username-initials').textContent = usernameInitials
}).catch(error => console.error('Error fetching user data:', error))

// Delete image confirmation
function confirmDelete (imageId) {
  const confirmDeletion = confirm('Are you sure you want to delete this file?')
  if (confirmDeletion) {
    deleteImage(imageId)
  }
}

// Delete image
function deleteImage (imageId) {
  fetch(`/images/${imageId}`, {
    method: 'DELETE',
    credentials: 'include' // Send some cookies with the request if needed for authentication
  })
    .then(response => {
      if (response.ok) {
        alert('File deleted successfully')
        // Refresh the list of files
        window.location.reload()
      } else {
        alert('Error deleting file')
      }
    })
    .catch(error => console.error('Error deleting file:', error))
}
