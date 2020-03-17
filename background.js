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
    "names_arr": []
  });
});

// Restore previous state of popup (sessions and user preferences) stored in chrome.storage when new tab is opened
function restore_user() {
  // Restore popup HTML with previous state 
  chrome.storage.sync.get("prev_state", function(state) {
    // State is null only upon download, only change if not null
    if (state != null) {

    }
  });

  // Restore user preferences
  chrome.storage.sync.get("preference_arr", function(arr) {
    
  });
}

// Add a session row into the popup menu
function add_row(name) {
  // Inject row into popup
  let menu = document.getElementById("popup-background");
  let div = document.createElement("div");
  div.id = name;
  div.innerHTML = name;
  menu.appendChild(div);

  // Update previous state in chrome.storage
  chrome.storage.sync.get("prev_state", function(state) {

  });

  // Update names array in chrome.storage
  chrome.storage.sync.get("names_arr", function(arr) {

  });
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
//-------------------------------------Button Logic--------------------------------------------------//
///////////////////////////////////////////////////////////////////////////////////////////////////////

// Saving current tab and updating popup
function save_tab() {
  console.log("tab pressed");
  // Get url of user's current tab
  chrome.tabs.query({
    active: true, currentWindow: true
  }, function(tabs) {
      console.log(tabs);
      let tab = tabs[0];
      let url = [tab.url];
      let name = "tab";

      // Update session in chrome.storage
      chrome.storage.sync.set({name: url});

      // Update popup menu
      add_row(name);
  });
}

// Saving current session (all tabs of window)
function save_session() {
  alert("session pressed");
}

// Opening settings HTML page
function open_settings() {
  alert("settings pressed");
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
//-------------------------------------Event Listeners-----------------------------------------------//
///////////////////////////////////////////////////////////////////////////////////////////////////////

// Only create event listeners and restore popup after DOM has loaded
window.onload = function() {
  restore_user();
  document.getElementById("tab").addEventListener("click", save_tab);
  document.getElementById("session").addEventListener("click", save_session);
  document.getElementById("settings").addEventListener("click", open_settings);
};
