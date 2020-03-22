///////////////////////////////////////////////////////////////////////////////////////////////////////
//-------------------------------------Initialization------------------------------------------------//
///////////////////////////////////////////////////////////////////////////////////////////////////////

// On installation, create variable to denote previous state of popup, array for user preferences, and array for
// session names
// Default user preferences are to ask for confirmation, not close sessions/tabs upon saving,
// and doing nothing after opening session
// [ask confirmation, close tab on tab save, close window on window save, open session action]
chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({
    "prev_state": null,
    "preference_arr": [true, false, false, 1],
    "names_arr": [],
    "num_sessions": 0
  });
});


