fetch('/current-user').then(response => {
  if (!response.ok) {
    throw new Error('Failed to fetch user data')
  }
  return response.json()
}).then(user => {
  document.getElementById('user-name').textContent = user.name
  document.getElementById('user-email').textContent = user.email
}).catch(error => console.error('Error fetching user data:', error)).catch(error => console.error('Error fetching user data:', error))
