console.log("dkbg.js");

chrome.runtime.onInstalled.addListener(function(details) { // when the extension is first installed
  localStorage["dekardashianize"] = JSON.stringify(true); // master on-off switch for the extension
  Keywords = ["Kardashian","Kanye","Kimye","Kim K","Khloe","Jenner","North West"];
  localStorage["dekardashianizer_keywords"] = JSON.stringify(Keywords); // initialize the keywords preferences
});

chrome.tabs.onUpdated.addListener(function(id, info, tab){ // Listen for any changes to the URL of any tab.
  if ( tab.url.toLowerCase().indexOf("huffingtonpost")>0 ){ // see: http://developer.chrome.com/extensions/tabs.html#event-onUpdated

    var dk = JSON.parse(localStorage["dekardashianize"]);
    chrome.pageAction.show(tab.id); // show the page action
    if ( dk) {
      chrome.pageAction.setIcon({ tabId: tab.id, path: "dk-on-32.png" });
    }
    else {
      chrome.pageAction.setIcon({tabId: tab.id, path: 'dk-off-32.png'});
    }

    if ( tab.status == "complete" ){
      if ( dk ){
        console.log("Preparing to dekardashianize! tab.id="+tab.id);
        var kw = JSON.parse(localStorage["dekardashianizer_keywords"]);
        console.log(kw);

        // Note 1: although HuffPo loads jQuery it overrides $ so we'll load it ourselves
        // Note 2: the background script shares localStorage with the popup but NOT with the pageAction script
        // Therefore we need to pass the keywords from this background script to the pageAction

        chrome.tabs.executeScript(tab.id, { file: "jquery.min.js" }, function(){ // load jquery
          chrome.tabs.executeScript(tab.id, { file: "dekardashianizer.js" }, function() { // then invoke the dekardashianizer in the callback
            chrome.tabs.sendMessage(tab.id, {Keywords: kw}); // then send a message in the callback from that! (2 levels of callbacks)
          });
        });

             }
      else {
        console.log("Dekardashianizing is disabled.");
      }
    }
  }
});

chrome.pageAction.onClicked.addListener(function(tab) { // show the popup when the user clicks on the page action.
  chrome.pageAction.show(tab.id);
});
