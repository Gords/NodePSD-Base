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

	// Listen for total # of selected files for upload
	document.addEventListener("htmx:afterSettle", () => {
		const filesButton = document.getElementById("select-files-btn");
		console.log(`the button is selected ${filesButton}`);

		const filesCounter = document.getElementById("upload-new-user-files");
		console.log(`the counter is selected ${filesCounter}`);

		filesCounter.addEventListener("change", () => {
			const fileCount = filesCounter.files.length;
			if (fileCount === 0) {
				filesButton.innerHTML = "Seleccionar archivos";
			} else {
				filesButton.innerHTML = `${fileCount} archivo(s) seleccionado(s)`;
			}
		});
	});
});
