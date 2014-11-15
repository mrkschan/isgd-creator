// Supporting context menu item that creates isgd URL of the selected link
self.on('click', function(node, data) {
  self.postMessage(node.href);
});
