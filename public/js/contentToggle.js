const main = document.querySelector("main");

const routes = {
  "": "spa-content",
  "#home": "spa-content",
  "#products-and-calculator": "spa-content",
  "#faq": "spa-content",
  "#about": "spa-content",
  "#contact": "spa-content",
  "#register": "register-content",
  "#login": "login-content",
};

const route = () => {
  const path = location.hash;
  const contentId = routes[path] || "";
  showContent(contentId);
};

const linkClickHandler = (event) => {
  event.preventDefault();
  const path = event.target.getAttribute("href") || "/";
  history.pushState({}, null, path);
  route();
};

const initializeRouting = () => {
  const navLinks = document.querySelectorAll("nav a");
  for (const link of navLinks) {
    link.addEventListener("click", linkClickHandler);
  }

  window.addEventListener("popstate", route);
  route();
};

function showContent(contentId) {
  const contentSections = document.querySelectorAll('section[id$="-content"]');
  for (const section of contentSections) {
    section.style.display = section.id === contentId ? "block" : "none";
  }
}

const setupDropdownEvents = () => {
  const dropdownToggle = document.getElementById("dropdown-toggle");
  const dropdownMenu = document.getElementById("dropdown-menu");

  if (dropdownToggle && dropdownMenu) {
    dropdownToggle.removeEventListener("click", toggleDropdown);
    dropdownToggle.addEventListener("click", toggleDropdown);
  } else {
    console.log("Dropdown elements not found:", dropdownToggle, dropdownMenu);
  }
};

const attachDropdownToggle = () => {
  document.body.addEventListener("htmx:load", setupDropdownEvents);
  setupDropdownEvents();
};

function toggleDropdown() {
  const dropdownMenu = document.getElementById("dropdown-menu");
  dropdownMenu?.classList.toggle("hidden");
}

initializeRouting();
attachDropdownToggle();
