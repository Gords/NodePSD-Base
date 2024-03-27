// Fetch user details
fetch('/current-user').then(response => {
  if (!response.ok) {
    throw new Error('Failed to fetch user data')
  }
  return response.json()
}).then(user => {
  document.getElementById('user-name').textContent = user.name
  document.getElementById('user-email').textContent = user.email
}).catch(error => console.error('Error fetching user data:', error)).catch(error => console.error('Error fetching user data:', error))


fetch('/images/user-images')
  .then(response => response.json())
  .then(images => {
    const fileList = document.getElementById('file-name-display');
    fileList.innerHTML = ''; // Clear existing entries
    images.forEach(image => {
      const li = document.createElement('li');
      li.textContent = image.fileName;
      fileList.appendChild(li);
    });
  })
  .catch(error => console.error('Error fetching user images:', error));
