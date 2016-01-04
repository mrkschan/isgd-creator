var buttons = require('sdk/ui/button/action'),
    clipboard = require('sdk/clipboard'),
    contextmenu = require('sdk/context-menu'),
    notifications = require('sdk/notifications'),
    requests = require('sdk/request'),
    self = require('sdk/self'),
    tabs = require('sdk/tabs'),
    urls = require('sdk/url'),
    _ = require('sdk/l10n').get;

// Setup action button
var isgdButton = buttons.ActionButton({
  id: 'isgdcreator-button',
  label: _('Create is.gd shortened URL for the current page'),
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
  image: self.data.url('icon-16.png'),
  label: _('Create is.gd URL for this page...'),
  context: contextmenu.PredicateContext(function(c) { return true; }),
  contentScriptFile: self.data.url('script/pagecontext.js'),
  onMessage: function(url) {
    isgdify(url);
  }
});

contextmenu.Item({
  image: self.data.url('icon-16.png'),
  label: _('Create is.gd URL for this link...'),
  context: contextmenu.SelectorContext('a'),
  contentScriptFile: self.data.url('script/linkcontext.js'),
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
    url: 'https://is.gd/api.php?longurl=' + escape(url),
    onComplete: function(response) {
      var isgd = response.text;

      clipboard.set(isgd, 'text');
      notifications.notify({
        title: 'is.gd Creator',
        text: _('URL copied to clipboard - %s', isgd),
        iconURL: self.data.url('icon-32.png')
      });
    }
  }).get();
}
