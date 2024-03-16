// // Function to set the logged-in state
// function setUserState (isLoggedIn) {
//   const html = document.documentElement
//   if (isLoggedIn) {
//     html.classList.add('logged-in')
//   } else {
//     html.classList.remove('logged-in')
//   }
//   localStorage.setItem('isLoggedIn', isLoggedIn)
// }

// // Check if the logged-in state is already stored in local storage
// document.addEventListener('DOMContentLoaded', function () {
//   const loggedInState = localStorage.getItem('isLoggedIn')
//   setUserState(loggedInState === 'true')

//   // Assuming you have a button to toggle the logged-in state
//   const toggleLoginButton = document.getElementById('toggleLogin')
//   toggleLoginButton.addEventListener('click', function () {
//     const currentState = localStorage.getItem('isLoggedIn') === 'true'
//     setUserState(!currentState)
//   })
// })


function setLoginState(isLoggedIn) {
    localStorage.setItem('isLoggedIn', isLoggedIn);
}