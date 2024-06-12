// Behaviour for the file upload section in the user panel

// Global access to fileList array and updateUploadFileList function
// (the code migrated from codepen that was written in jquery wouldn't run unless these were global)
const fileList = [];

// Update the list of files that are ready to be uploaded
function updateUploadFileList() {
	const fileListElement = document.getElementById("file-upload-list");
	fileListElement.innerHTML = ""; // Clear existing entries

	// Determine icon based on file type
	fileList.forEach((file, index) => {
		// Default document icon
		let fileIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>`;
		// Image icon
		if (file.type.includes("image")) {
			fileIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>`;

			// PDF icon
		} else if (file.type === "application/pdf") {
			fileIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>`;
		}

		// X Icon to remove file from upload list
		const removeIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>`;

		// Create the list that includes each file in the upload form
		const listItem = document.createElement("div");
		listItem.id = "file-upload-list-item";
		listItem.className =
			"bg-neutral p-2 flex justify-between items-center rounded-lg mb-2";
		listItem.setAttribute("data-index", index);
		listItem.innerHTML = `
			<span>${fileIcon}</span>
			<div>${file.name}</div>
			<div class="remove-file">${removeIcon}</div>
			`;
		// Attach click event listener to the remove button of each file
		//TODO: ITS NOT WORKING! Linked to issue https://github.com/Runewerk/flashcenter/issues/32
		listItem.querySelector(".remove-file").addEventListener("click", () => {
			fileList.splice(index, 1);
			updateUploadFileList();
		});

		fileListElement.appendChild(listItem);
	});
}

// Initialize the file list
document.addEventListener("DOMContentLoaded", () => {
	// TODO: Currently, we only check allowed types client-side
	const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

	function handleFiles(files) {
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const isFileTypeAllowed = allowedTypes.includes(file.type);
			const isFileAlreadyAdded = fileList.some(
				(existingFile) => existingFile.name === file.name,
			);

			if (isFileTypeAllowed && !isFileAlreadyAdded) {
				fileList.push(file);
			}
		}

		updateUploadFileList();
	}

	document
		.getElementById("files-to-upload")
		.addEventListener("change", function () {
			handleFiles(this.files);
		});

		const submitFilesButton = document.getElementById("submit-files");

		if (submitFilesButton) {
		  submitFilesButton.addEventListener("click", () => {
			// Wait for the response to be processed and the user files to be updated
			document.body.addEventListener("htmx:afterSettle", function handler(event) {
			  if (event.detail.target.id === "user-files") {
				// Clear the fileList array
				fileList.length = 0;
	  
				// Update the file list display
				updateUploadFileList();
			  }
			});
		  });
		}

	// Drag and drop functionality and styling
	// Why the heck is the color being manipulated here?
	const dropArea = document.getElementById("drop-area");
	dropArea.addEventListener("dragover", (e) => {
		e.preventDefault();
		gsap.to("#drop-area", {
			borderColor: "#ccc",
			background: "#3a4669",
			duration: 0.2,
		});
	});
	dropArea.addEventListener("dragleave", (e) => {
		e.preventDefault();
		gsap.to("#drop-area", {
			borderColor: "#ccc",
			background: "#3a4669",
			duration: 0.2,
		});
	});
	dropArea.addEventListener("drop", (e) => {
		e.preventDefault();
		const files = e.dataTransfer.files;
		handleFiles(files);
		gsap.to("#drop-area", {
			borderColor: "#ccc",
			background: "#283048",
			duration: 0.2,
		});
	});
});
