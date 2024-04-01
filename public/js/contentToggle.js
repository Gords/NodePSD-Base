const main = document.querySelector('main');

const route = () => {
  let path = location.hash;
  switch (path) {
    case '':
    case '#home':
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
  // Capture scroll position before pushState
  localStorage.setItem('scrollTop', window.scrollY);
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

// Restore scroll position on initial load and after refresh
document.addEventListener('DOMContentLoaded', (event) => {
  const scrollTop = localStorage.getItem('scrollTop');
  if (scrollTop) {
    window.scrollTo(0, scrollTop);
    localStorage.removeItem('scrollTop'); // Clear after use
  }
});

// Call the route function initially
route();

