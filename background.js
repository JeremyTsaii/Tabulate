///////////////////////////////////////////////////////////////////////////////////////////////////////
//-------------------------------------Initialization------------------------------------------------//
///////////////////////////////////////////////////////////////////////////////////////////////////////

// On installation, create variable to denote previous state of popup, array for user preferences, and array for
// session names
// Default user preferences are to ask for confirmation and close sessions/tabs upon saving
// [close session upon saving, close tab upon saving, ask for confirmation before deleting session]
chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({
    "prev_state": null,
    "preference_arr": [true, true, true],
    "names_arr": [],
    "num_sessions": 0
  });
});


