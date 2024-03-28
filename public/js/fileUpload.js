// File Upload with Drag and Drop

// Global access to fileList
let fileList = [];

// Global access to updateFileList function
function updateFileList () {
  const fileListElement = document.getElementById('file-list')
  fileListElement.innerHTML = ''
  fileList.forEach((file, index) => {
    let fileIcon = '<i class="fas fa-file"></i>'
    if (file.type.includes('image')) {
      fileIcon = '<i class="fas fa-image"></i>'
    } else if (file.type === 'application/pdf') {
      fileIcon = '<i class="fas fa-file-pdf"></i>'
    }
    const listItem = document.createElement('div')
    listItem.className = 'file-list-item'
    listItem.setAttribute('data-index', index)
    listItem.innerHTML = `
              ${fileIcon}
              <div>${file.name}</div>
              <div class="remove-file"><i class="fas fa-times"></i></div>
          `
    fileListElement.appendChild(listItem)
  })
  document.getElementById('dropfileSubmitBtn').disabled = fileList.length === 0
  const removeFileElements = document.getElementsByClassName('remove-file')
  Array.from(removeFileElements).forEach(element => {
    element.addEventListener('click', function () {
      const name = this.parentElement.querySelector('div').textContent;
      fileList = fileList.filter(file => file.name !== name);
      updateFileList();
    });
  });
}

// 1. File selection and validation
document.addEventListener('DOMContentLoaded', function () {
  // TODO: Currently, we only check allowed types client-side
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

  function handleFiles(files) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isFileTypeAllowed = allowedTypes.includes(file.type);
      const isFileAlreadyAdded = fileList.some(existingFile => existingFile.name === file.name);

      if (isFileTypeAllowed && !isFileAlreadyAdded) {
        fileList.push(file);
      }
    }

    updateFileList();
  }


  document.getElementById('fileElem').addEventListener('change', function () {
    handleFiles(this.files)
  })

  const dropArea = document.getElementById('drop-area')
  dropArea.addEventListener('dragover', function (e) {
    e.preventDefault()
    gsap.to('#drop-area', { borderColor: '#007bff', background: '#e9f5ff', duration: 0.2 })
  })
  dropArea.addEventListener('dragleave', function (e) {
    e.preventDefault()
    gsap.to('#drop-area', { borderColor: '#007bff', background: '#fff', duration: 0.2 })
  })
  dropArea.addEventListener('drop', function (e) {
    e.preventDefault()
    const files = e.dataTransfer.files
    handleFiles(files)
    gsap.to('#drop-area', { borderColor: '#ccc', background: '#fff', duration: 0.2 })
  })
})

// Upload file(s) button
document.getElementById('dropfileSubmitBtn').addEventListener('click', async () => {
  const formData = new FormData();
  fileList.forEach(file => {
    formData.append('files', file); // Use 'files' to match the backend if it expects an array
  });

  try {
    const response = await fetch('/images', {
      method: 'POST',
      body: formData,
      credentials: 'same-origin' // Ensure cookies for session are sent with the request
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Files uploaded successfully', result);
      fileList.length = 0; // Clear the file list
      updateFileList(); // Update the UI
    } else {
      throw new Error('Network response was not ok.');
    }
  } catch (error) {
    console.error('Error uploading files:', error);
  }
});
