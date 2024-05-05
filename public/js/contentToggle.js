const main = document.querySelector("main");

const route = () => {
  const path = location.hash;
  switch (path) {
    case "":
    case "#home":
    case "#products-and-calculator":
    case "#faq":
    case "#about":
    case "#contact":
      showContent("spa-content");
      break;
    case "#register":
      showContent("register-content");
      break;
    case "#login":
      showContent("login-content");
      break;
    default:
      break;
  }
};

const linkClickHandler = (event) => {
  event.preventDefault();
  let path = event.target.getAttribute("href") || "/";
  if (!path.startsWith("/")) path = `/${path}`;
  history.pushState({}, null, path);
  route();
};

const navLinks = document.querySelectorAll("nav a");
for (const link of navLinks) {
  link.addEventListener("click", linkClickHandler);
}

window.addEventListener("popstate", () => {
  route();
});

function showContent(contentId) {
  const contentSections = document.querySelectorAll('section[id$="-content"]');
  for (const section of contentSections) {
    section.style.display = section.id === contentId ? "block" : "none";
  }
}

// Call the route function initially
route();

// Hamburger menu toggle
document.body.addEventListener("htmx:load", (event) => {
  attachDropdownToggle();
});

function attachDropdownToggle() {
  const dropdownToggle = document.getElementById("dropdown-toggle");
  const dropdownMenu = document.getElementById("dropdown-menu");
  if (dropdownToggle && dropdownMenu) {
    // Remove existing event listeners to avoid duplicates
    dropdownToggle.removeEventListener("click", toggleDropdown);
    // Reattach the event listener
    dropdownToggle.addEventListener("click", toggleDropdown);
  } else {
    console.log("Dropdown elements not found:", dropdownToggle, dropdownMenu);
  }
}

function toggleDropdown() {
  const dropdownMenu = document.getElementById("dropdown-menu");
  if (dropdownMenu) {
    dropdownMenu.classList.toggle("hidden");
  } else {
    console.log("Failed to find dropdown menu for toggling.");
  }
}
