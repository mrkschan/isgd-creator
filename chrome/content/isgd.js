/* ***** BEGIN LICENSE BLOCK *****
*   Version: MPL 1.1/GPL 2.0/LGPL 2.1
*
* The contents of this file are subject to the Mozilla Public License Version
* 1.1 (the "License"); you may not use this file except in compliance with
* the License. You may obtain a copy of the License at
* http://www.mozilla.org/MPL/
* 
* Software distributed under the License is distributed on an "AS IS" basis,
* WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
* for the specific language governing rights and limitations under the
* License.
*
* The Original Code is is.gd Creator.
*
* The Initial Developer of the Original Code is
* Karsten Schmidt.
* Portions created by the Initial Developer are Copyright (C) 2008
* the Initial Developer. All Rights Reserved.
*
* Contributor(s):
*
* Alternatively, the contents of this file may be used under the terms of
* either the GNU General Public License Version 2 or later (the "GPL"), or
* the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
* in which case the provisions of the GPL or the LGPL are applicable instead
* of those above. If you wish to allow use of your version of this file only
* under the terms of either the GPL or the LGPL, and not to allow others to
* use your version of this file under the terms of the MPL, indicate your
* decision by deleting the provisions above and replace them with the notice
* and other provisions required by the GPL or the LGPL. If you do not delete
* the provisions above, a recipient may use your version of this file under
* the terms of any one of the MPL, the GPL or the LGPL.
* 
* ***** END LICENSE BLOCK ***** */

var IsGdCreator = {
    
    focused: null,
    
    onLoad: function() {
        IsGdCreator.addToolbarButton();
        var contextMenu = document.getElementById("contentAreaContextMenu");
        if (contextMenu) {
            contextMenu.addEventListener("popupshowing", function(e) { IsGdCreator.onShowContextMenu(e); }, false);
        }
        gBrowser.addProgressListener(IsGd_OnLocationChangeListener,Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT);
        document.getElementById("isgdcreator-toolbar-button").disabled = true;
        document.getElementById("isgdcreator-pagemenu").hidden = true;
        document.getElementById("isgdcreator-selectionmenu").hidden = true;
        //Application.console.open();
    },
    
    onUnload: function() {
        gBrowser.removeProgressListener(IsGd_OnLocationChangeListener);
    },
    
    onShowContextMenu: function(e) {
        document.getElementById("isgdcreator-context-linkmenu").hidden = !gContextMenu.onLink;
        document.getElementById("isgdcreator-context-pagemenu").hidden = !IsGdCreator.isValidURL(window._content.location.href);
        var isSelected = !IsGdCreator.isURLSelected();
        document.getElementById("isgdcreator-context-selectionmenu").hidden = isSelected;
        document.getElementById("isgdcreator-selectionmenu").hidden = isSelected;
    },
    
    onFocus: function() {
        IsGdCreator.focused = document.commandDispatcher.focusedElement;
        //Application.console.log("focused: "+IsGdCreator.focused);
    },
    
    createFromAnchor: function(anchor) {
        var linkURL = 'getLinkURL' in gContextMenu ? gContextMenu.getLinkURL() : gContextMenu.linkURL();
        if (linkURL != null && this.isValidURL(linkURL)) {
            IsGdCreator.doCreate(linkURL);
        }
    },
    
    createFromCurrent: function() {
        // text selection has priority over currently active URL
        if (IsGdCreator.isURLSelected()) {
            this.createFromSelection();
        } else {
            IsGdCreator.doCreate(window._content.location.href);
        }
    },
    
    createFromSelection: function(element) {
        //Application.console.log(element);
        if (IsGdCreator.focused!=null) {
            var sel=IsGdCreator.focused.value.substring(IsGdCreator.focused.selectionStart,IsGdCreator.focused.selectionEnd);
            IsGdCreator.doCreate(sel);
        }
    },
    
    doCreate: function(longURL) {
        try {
            if (!this.isValidURL(longURL)) throw "Error: the URL is invalid";
            const props = IsGdCreator.getProperties();
            const prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.isgdcreator.");
            try {
                const alertService = Components.classes["@mozilla.org/alerts-service;1"].getService(Components.interfaces.nsIAlertsService);
            } catch(err) {
                // probably OSX prior to FF3 or Linux, have to revert to JS alerts
            }
            var r=new XMLHttpRequest();
            r.open("GET", "http://is.gd/api.php?longurl="+escape(longURL), true);
            r.onload=function() {
                if (r.responseText) {
                    if (r.status == 200) {
                        if (prefs.getBoolPref("autocopy")) {
                            var clipboard = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
                            clipboard.copyString(r.responseText);
                            if (alertService!=null) {
                                alertService.showAlertNotification("chrome://isgdcreator/skin/icon.png", 
                                    props.GetStringFromName("addonName"), props.GetStringFromName("successCopied")+": "+r.responseText, 
                                    false, "", null);
                            } else {
                                alert(props.GetStringFromName("addonName")+"\n"+props.GetStringFromName("successCopied")+": "+r.responseText);
                            }
                        } else {
                            alert(props.GetStringFromName("addonName")+"\n"+props.GetStringFromName("successNotCopied")+": "+r.responseText);
                        }
                    } else {
                        if (alertService!=null) {
                            alertService.showAlertNotification("chrome://isgdcreator/skin/icon.png", 
                                props.GetStringFromName("addonName"), props.GetStringFromName("isgdError")+":\n"+r.responseText, 
                                false, "", null);
                        } else {
                            alert(props.GetStringFromName("addonName")+"\n"+props.GetStringFromName("isgdError")+":\n"+r.responseText);
                        }
                    }
                }
            };
            r.onerror=function(e) {
                alert(props.formatStringFromName("httpError",[e.target.status],1));
            };
            r.send(null);
        } catch(err) {
            alert(err);
        }
    },
    
    isValidURL: function(url) {
        // pattern based on: http://www.weberdev.com/get_example-4569.html
        //var urlPattern = /^(([\w]+:)?\/\/)?(([\d\w]|%[a-fA-f\d]{2,2})+(:([\d\w]|%[a-fA-f\d]{2,2})+)?@)?([\d\w][-\d\w]{0,253}[\d\w]\.)+[\w]{2,4}(:[\d]+)?(\/([-+_~:.\d\w]|%[a-fA-f\d]{2,2})*)*(\?(&?([-+_~.\d\w]|%[a-fA-f\d]{2,2})=?)*)?(#([-+_~.\d\w]|%[a-fA-f\d]{2,2})*)?$/;
        // pattern from: http://snippets.dzone.com/posts/show/452
        var urlPattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
        return urlPattern.test(url);
    },
    
    isURLSelected: function() {
        if (IsGdCreator.focused!=null) {
            var sel=IsGdCreator.focused.value.substring(IsGdCreator.focused.selectionStart,IsGdCreator.focused.selectionEnd);
            return IsGdCreator.isValidURL(sel);
        }
        return false;
    },
    
    getProperties: function() {
        var localeService=Components.classes["@mozilla.org/intl/nslocaleservice;1"].getService(Components.interfaces.nsILocaleService);
        var bundleService=Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
        return bundleService.createBundle("chrome://isgdcreator/locale/isgd.properties",localeService.getApplicationLocale());
    },
    
    /**
    * Automatically adds toolbar button on first run
    */
    addToolbarButton: function() {
        // Get preferences
        const prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.isgdcreator.");
        if(!prefs.prefHasUserValue("isInstalled")) {
            document.getElementById("nav-bar").insertItem("isgdcreator-toolbar-button", document.getElementById("urlbar-container"));
            document.persist("nav-bar", "currentset"); 
            prefs.setBoolPref("isInstalled",true);
        }
    }
};

window.addEventListener("load", IsGdCreator.onLoad, false);
window.addEventListener("unload", IsGdCreator.onUnload, false);
window.addEventListener("click",IsGdCreator.onFocus, false);

