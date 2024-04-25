document.addEventListener("DOMContentLoaded", () => {
	// Attach the event listener to the document or a static parent element so that it can handle events from dynamically added elements
	document.body.addEventListener("click", async (event) => {
		if (event.target.id === "download-all-files") {
			const links = document.querySelectorAll('a[id="download-link"]');
			const imageUrls = Array.from(links).map((link) => link.href); // Extract hrefs from links

			for (const url of imageUrls) {
				try {
					const response = await fetch(url);
					if (!response.ok)
						throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
					const blob = await response.blob();
					const filename = url.substring(url.lastIndexOf("/") + 1); // Extract filename

					// Create a temporary anchor tag to trigger download
					const a = document.createElement("a");
					a.href = URL.createObjectURL(blob);
					a.download = filename;
					document.body.appendChild(a);
					a.click();
					URL.revokeObjectURL(a.href);
					a.remove();

					console.log(`Downloaded file '${filename}' successfully`);
				} catch (error) {
					console.error(`Error downloading ${url}:`, error);
				}
			}
		}
	});
});

// Function to generate a random number within a specified range
function getRandomNumber(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate 6 random numbers
const randomNumbers = [];
for (let i = 0; i < 6; i++) {
	const randomNumber = getRandomNumber(1, 100); // Adjust the range as needed
	randomNumbers.push(randomNumber);
}

console.log("Random numbers:", randomNumbers);
