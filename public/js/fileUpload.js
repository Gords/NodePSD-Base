// File Upload with Drag and Drop

// Global access to fileList
const fileList = []

// Global access to updateFileList function
function updateFileList () {
  const fileListElement = document.getElementById('file-list')
  fileListElement.innerHTML = '' // Clear existing entries

  // Determine icon based on file type
  fileList.forEach((file, index) => {
    // Default document icon
    let fileIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
</svg>
`
    // Camera (image) icon
    if (file.type.includes('image')) {
      fileIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
</svg>` 
      
    // PDF icon
    } else if (file.type === 'application/pdf') {
      fileIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
</svg>
`
    }

    // "X" icon for the remove button
    const removeIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>`;



    // Create list item for each file
    const listItem = document.createElement('div')
    listItem.className = 'file-list-item'
    listItem.setAttribute('data-index', index)
    listItem.innerHTML = `
      <span>${fileIcon}</span>
      <div>${file.name}</div>
      <div class="remove-file">${removeIcon}</div>
    `
    fileListElement.appendChild(listItem)
  })

  document.getElementById('dropfileSubmitBtn').disabled = fileList.length === 0

  // Attach click event listener to remove buttons
  const removeFileElements = fileListElement.getElementsByClassName('remove-file')
  Array.from(removeFileElements).forEach(element => {
    element.addEventListener('click', function (event) {
      event.stopPropagation()
      const index = parseInt(this.parentElement.getAttribute('data-index'), 10)
      fileList.splice(index, 1)
      updateFileList()
    })
  })
}

// 1. File selection and validation
document.addEventListener('DOMContentLoaded', function () {
  // TODO: Currently, we only check allowed types client-side
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']

  function handleFiles (files) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const isFileTypeAllowed = allowedTypes.includes(file.type)
      const isFileAlreadyAdded = fileList.some(existingFile => existingFile.name === file.name)

      if (isFileTypeAllowed && !isFileAlreadyAdded) {
        fileList.push(file)
      }
    }

    updateFileList()
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
  const formData = new FormData()
  fileList.forEach(file => {
    formData.append('files', file) // Use 'files' to match the backend if it expects an array
  })

  try {
    const response = await fetch('/images', {
      method: 'POST',
      body: formData,
      credentials: 'same-origin' // Ensure cookies for session are sent with the request
    })

    if (response.ok) {
      const result = await response.json()
      console.log('Files uploaded successfully', result)
      fileList.length = 0 // Clear the file list
      updateFileList() // Update the UI
    } else {
      throw new Error('Network response was not ok.')
    }
  } catch (error) {
    console.error('Error uploading files:', error)
  }
})
