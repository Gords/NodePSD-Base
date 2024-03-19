// Purpose: To hide the login and register buttons when the user is logged in and show the logout button.
//          This is done by checking the value of the 'loggedIn' key in the localStorage object and updating the display property of the buttons accordingly.
//
//          The 'loggedIn' key is set to 'true' when the user logs in and set to 'false' when the user logs out.

document.addEventListener('DOMContentLoaded', function() {
  const loggedIn = localStorage.getItem('loggedIn');
  const loginButton = document.querySelector('a[href="/login"]');
  const registerButton = document.querySelector('a[href="/registro"]');
  const logoutButton = document.getElementById('logout-button');
  
  if (loggedIn === 'true') {
    loginButton.style.display = 'none';
    registerButton.style.display = 'none';
    logoutButton.style.display = 'inline-flex'; // Show logout button
  } else {
    loginButton.style.display = 'inline-flex';
    registerButton.style.display = 'inline-flex';
    logoutButton.style.display = 'none'; // Hide logout button
  }
});

// Logout function
function logout() {
  localStorage.removeItem('loggedIn');
  window.location.reload(); // Refresh the page to reflect the change in UI
}

// Attach the logout function to the window object to make it accessible from the onclick attribute in the HTML
window.logout = logout;

// TODO: there has to be a way to replace some of this functions with pure htmx attributes