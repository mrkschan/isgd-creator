// Supporting context menu item that creates isgd URL of the active page
self.on('click', function(node, data) {
  self.postMessage(document.URL);
});
