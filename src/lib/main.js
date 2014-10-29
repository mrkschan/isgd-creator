var buttons = require('sdk/ui/button/action'),
    requests = require('sdk/request'),
    tabs = require('sdk/tabs'),
    urls = require('sdk/url');

var isgdButton = buttons.ActionButton({
  id: "isgdcreator-button",
  label: "Create is.gd shortened URL for the current page",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png"
  },
  onClick: function(state) {
    var url = tabs.activeTab.url;

    if (!urls.isValidURI(url)) {
      return;
    }

    requests.Request({
      url: 'http://is.gd/api.php?longurl=' + escape(url),
      onComplete: function(response) {
        console.log(response.text);
      }
    }).get();
  }
});
