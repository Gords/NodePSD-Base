// Purpose: To update the browser's URL without refreshing the page when a link is clicked.
//          This is done by listening for the 'htmx:afterOnLoad' event and updating the URL using the pushState method.

document.body.addEventListener('htmx:afterOnLoad', function (event) {

  // Check if the triggered element (navbar element) has an 'href' attribute
  var target = event.detail.elt; // 'elt' is the element that triggered the HTMX request
  var url = target.getAttribute('hx-get'); // href also works instead of hx-get

  if (url) {
    // Update the browser's URL without refreshing the page
    window.history.pushState({path: url}, '', url);
  }
});