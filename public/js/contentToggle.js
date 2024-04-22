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
for (const section of contentSections) {
	section.style.display = section.id === contentId ? "block" : "none";
}
