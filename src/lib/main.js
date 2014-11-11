var buttons = require('sdk/ui/button/action'),
    clipboard = require('sdk/clipboard'),
    contextmenu = require('sdk/context-menu'),
    notifications = require('sdk/notifications'),
    requests = require('sdk/request'),
    self = require('sdk/self'),
    tabs = require('sdk/tabs'),
    urls = require('sdk/url');

// Setup action button
var isgdButton = buttons.ActionButton({
  id: 'isgdcreator-button',
  label: 'Create is.gd shortened URL for the current page',
  icon: {
    '16': './icon-16.png',
    '32': './icon-32.png'
  },
  onClick: function(state) {
    isgdify(tabs.activeTab.url);
  }
});

// Setup context menu
contextmenu.Item({
  label: 'Create is.gd URL for this page...',
  context: contextmenu.PredicateContext(function(c) { return true; }),
  contentScriptFile: self.data.url('script/pagecontext.js'),
  onMessage: function(url) {
    isgdify(url);
  }
});

// Helpers
function isgdify(url) {
  if (!urls.isValidURI(url)) {
    return;
  }

  requests.Request({
    url: 'http://is.gd/api.php?longurl=' + escape(url),
    onComplete: function(response) {
      var isgd = response.text;

      clipboard.set(isgd, 'text');
      notifications.notify({
        title: 'is.gd Creator',
        text: 'URL copied to clipboard - ' + isgd,
        iconURL: self.data.url('icon-32.png')
      });
    }
  }).get();
}
