document.addEventListener('DOMContentLoaded', function () {
  const loggedIn = localStorage.getItem('loggedIn')
  const registerButton = document.querySelector('a[href="/register"]')
  const loginButton = document.querySelector('a[href="/login"]')
  const perfilDropdown = document.querySelector('details')

  function updateUI() {
    if (loggedIn === 'true') {
      registerButton.style.display = 'none'
      loginButton.style.display = 'none'
      perfilDropdown.style.display = 'block'
    } else {
      loginButton.style.display = 'inline-flex'
      registerButton.style.display = 'inline-flex'
      perfilDropdown.style.display = 'none'
    }
  }

  updateUI()

  // Handle login response
  document.body.addEventListener('htmx:afterSwap', function (event) {
    const loginFlashMessages = event.detail.elt.querySelector('#login-flash-messages')
    if (loginFlashMessages) {
      const successMessage = loginFlashMessages.querySelector('.alert-success')
      const errorMessage = loginFlashMessages.querySelector('.alert-error')

      if (successMessage) {
        // Login successful, update UI and set loggedIn flag
        localStorage.setItem('loggedIn', 'true')
        updateUI()
      } else if (errorMessage) {
        // Login failed, display error message
        console.error('Login failed:', errorMessage.textContent)
      }
    }
  })
})

// Logout function
function logout() {
  localStorage.removeItem('loggedIn')
  window.location.reload()
}

// Attach the logout function to the window object
window.logout = logout
