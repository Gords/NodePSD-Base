document.addEventListener('DOMContentLoaded', function () {
  const loggedIn = localStorage.getItem('loggedIn')
  const registerButton = document.querySelector('#registerButton')
  const loginButton = document.querySelector('#loginButton')
  const logoutButton = document.querySelector('#logoutButton')
  const userList = document.querySelector('#userList')
  const fileList = document.querySelector('#fileList')

  function updateUI () {
    if (loggedIn === 'true') {
      registerButton.style.display = 'none'
      loginButton.style.display = 'none'
      logoutButton.style.display = 'inline-flex'
      userList.style.display = 'block'
      fileList.style.display = 'block'
    } else {
      registerButton.style.display = 'inline-flex'
      loginButton.style.display = 'inline-flex'
      logoutButton.style.display = 'none'
      userList.style.display = 'none'
      fileList.style.display = 'none'
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
function logout () {
  localStorage.removeItem('loggedIn')
  window.location.reload()
}

// Attach the logout function to the window object
window.logout = logout

// Fetch user details
fetch('/check-login').then(response => {
  if (!response.ok) {
    throw new Error('Failed to fetch user data')
  }
  return response.json()
}).then(user => {
  document.getElementById('user-name').textContent = user.name
  document.getElementById('user-email').textContent = user.email
}).catch(error => console.error('Error fetching user data:', error)).catch(error => console.error('Error fetching user data:', error))

// Fetch user files
fetch('/images/user-images')
  .then(response => response.json())
  .then(images => {
    const fileList = document.getElementById('file-name-display')
    fileList.innerHTML = '' // Clear existing entries
    if (images.length === 0) {
      const li = document.createElement('li')
      li.textContent = 'No files found'
      fileList.appendChild(li)
    } else {
      images.forEach(image => {
        const li = document.createElement('li')
        li.textContent = image.fileName
        fileList.appendChild(li)
      })
    }
  })
  .catch(error => console.error('Error fetching user images:', error))
