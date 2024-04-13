// Fetch user details
fetch('/check-login')
  .then((response) => {
    if (!response.ok) {
      throw new Error('Failed to fetch user data')
    }
    return response.json()
  })
  .then((user) => {
    document.getElementById('user-name').textContent = user.name
    document.getElementById('user-email').textContent = user.email

    const usernameInitials = user.name ? user.name.charAt(0).toUpperCase() : ''
    document.getElementById('avatar-username-initials').textContent = usernameInitials
  })
  .catch((error) => console.error('Error fetching user data:', error))