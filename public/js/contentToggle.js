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

const linkClickHandler = (event) => {
  event.preventDefault();
  let path = event.target.getAttribute('href') || "/";
  if (!path.startsWith("/")) path = "/" + path;
  history.pushState({}, null, path);
  route();
};

document.querySelectorAll("nav a").forEach(link => {
  link.addEventListener("click", linkClickHandler);
});

window.addEventListener('popstate', () => {
  route();
});

function showContent(contentId) {
  const contentSections = document.querySelectorAll('section[id$="-content"]');
  contentSections.forEach(section => {
    section.style.display = section.id === contentId ? 'block' : 'none';
  });
}

// Call the route function initially
route();
