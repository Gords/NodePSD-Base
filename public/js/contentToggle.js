function showContent (contentId) {
  const contentSections = document.querySelectorAll('section[id$="-content"]')
  contentSections.forEach(section => {
    section.style.display = section.id === contentId ? 'block' : 'none'
  })
}
