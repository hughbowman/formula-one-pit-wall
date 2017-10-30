
// Various fixes to allow index.html to be run from a local filesystem
$(function() {
  if (window.location.protocol === 'file:') {
    var doNothing = function() { return; };

    window.history.back = doNothing;
    window.history.pushState = doNothing;
    window.history.replaceState = doNothing;
  }
});
