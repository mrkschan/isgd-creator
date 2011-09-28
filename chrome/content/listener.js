var IsGd_OnLocationChangeListener = {
    QueryInterface : function(aIID)
    {
        if (aIID.equals(Components.interfaces.nsIWebProgressListener)
            || aIID.equals(Components.interfaces.nsISupportsWeakReference)
        || aIID.equals(Components.interfaces.nsISupports))
        return this;
        throw Components.results.NS_NOINTERFACE;
    },
    
    onProgressChange : function() {},
    onSecurityChange : function() {},
    onStateChange : function() {},
    onStatusChange : function() {},
    onLinkIconAvailable : function() {},
    
    onLocationChange : function(progress, req, uri) {
        var isValid=uri!=null ? IsGdCreator.isValidURL(uri.spec) : false;
        document.getElementById("isgdcreator-pagemenu").hidden = !isValid;
        document.getElementById("isgdcreator-toolbar-button").disabled = !isValid;
    }
};

