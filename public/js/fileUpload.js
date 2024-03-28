// File Upload with Drag and Drop

// Global access to fileList
let fileList = [];

// 1. File selection and validation
document.addEventListener('DOMContentLoaded', function () {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']

  function handleFiles (files) {
    for (let i = 0; i < files.length; i++) {
      if (allowedTypes.includes(files[i].type) && !fileList.some(file => file.name === files[i].name)) {
        fileList.push(files[i])
      }
    }
    updateFileList()
  }

  // 2. Updating the file list display
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
                <span>${file.name}</span>
                <span class="remove-file"><i class="fas fa-times"></i></span>
            `
      fileListElement.appendChild(listItem)
    })
    document.getElementById('dropfileSubmitBtn').disabled = fileList.length === 0
    const removeFileElements = document.getElementsByClassName('remove-file')
    Array.from(removeFileElements).forEach(element => {
      element.addEventListener('click', function () {
        const index = this.parentElement.getAttribute('data-index')
        fileList.splice(index, 1)
        updateFileList()
      })
    })
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
    gsap.to('#drop-area', { borderColor: '#ccc', background: '#fff', duration: 0.2 })
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
