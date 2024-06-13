document.addEventListener("DOMContentLoaded", () => {
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
