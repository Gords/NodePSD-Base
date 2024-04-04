const main = document.querySelector('main');

const route = () => {
  let path = location.hash;
  switch (path) {
    case '':
    case '#home':
    case '#services':
    case '#faq':
    case '#about':
    case '#contact':
      showContent('spa-content');
      break;
    case '#register':
      showContent('register-content');
      break;
    case '#login':
      showContent('login-content');
      break;
    default:
      break;
  }
};


//Show/Hide content based in the id
function showContent(contentId) {
  const contentSections = document.querySelectorAll('section[id$="-content"]');
  contentSections.forEach(section => {
    section.style.display = section.id === contentId ? 'block' : 'none';
  });
}

// Add event lister to widow object to go back to page begining on refresh (if not on login or register page)
window.addEventListener('load', function () {
  if (window.location.hash !== '' && window.location.hash !== '#login' && window.location.hash !== '#register') {
    window.location.href = '/';
  }
});

window.addEventListener('popstate', () => {
  route();
});

// Call the route function initially
route();