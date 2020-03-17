///////////////////////////////////////////////////////////////////////////////////////////////////////
//-------------------------------------Initilization-------------------------------------------------//
///////////////////////////////////////////////////////////////////////////////////////////////////////




///////////////////////////////////////////////////////////////////////////////////////////////////////
//-------------------------------------JavaScript Injection------------------------------------------//
///////////////////////////////////////////////////////////////////////////////////////////////////////

// Add a session row into the popup menu
function add_row(name) {
  let menu = document.getElementById("popup-background");
  let div = document.createElement("div");
  div.id = "session";
  div.innerHTML = "TEST";
  menu.appendChild(div);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
//-------------------------------------Button Logic--------------------------------------------------//
///////////////////////////////////////////////////////////////////////////////////////////////////////

// Saving current tab
function save_tab() {
  // Get url of user's current tab
  chrome.tabs.query({
      active: true, currentWindow: true
  }, function(tabs) {
      let tab = tabs[0];
      let url = [tab.url];
      let name = "tab";

      // Update session in chrome.storage
      chrome.storage.sync.set({name: url});

      // Update popup menu
      add_row(name);
  });
}
document.getElementById("tab").addEventListener('click', save_tab);

// Saving current session (all tabs of window)
function save_session() {

}
document.getElementById("session").addEventListener('click', save_session);

// Opening settings HTML page
function open_settings() {

}
document.getElementById("settings").addEventListener('click', open_settings);