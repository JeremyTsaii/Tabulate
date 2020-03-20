///////////////////////////////////////////////////////////////////////////////////////////////////////
//-------------------------------------Button Logic--------------------------------------------------//
///////////////////////////////////////////////////////////////////////////////////////////////////////

// Restore previous state of popup (sessions and user preferences) stored in chrome.storage when new tab is opened
function restore_user() {
  // Restore popup HTML with previous state 
  chrome.storage.sync.get("prev_state", function(state) {
    // State is null only upon download, only update popup if not null
    if (state.prev_state != null) {
      // Delete current sessions-body
      document.getElementById("sessions-body").outerHTML = "";

      // Make dummy div to store inner HTML
      let div = document.createElement("div");
      div.innerHTML = state.prev_state;
      let new_state = div.firstChild;

      // Append state into correct position
      let anchor = document.getElementById("sessions"); // Reference point for insertion
      anchor.appendChild(new_state);
    }
  });

  // Restore user preferences
  chrome.storage.sync.get("preference_arr", function(arr) {
    
  });

  // Add event listener to session rows
  // Timeout to let popup load
  setTimeout(add_listener, 500);
}

function add_listener() {
  // Loop through and open all tabs
  document.getElementById("sessions-body").addEventListener("click", function(e){
    let obj = e.target;
    if (obj.className == "click-session") {
      let id = obj.id;
      chrome.storage.sync.get([id], function(val) {
        let arr = val[id];
        arr.forEach(function(val) {
          chrome.tabs.create({
            url: val
          });
        });
      });
    }
  });
}

// Saving current tab and updating popup
function save_tab() {
  // Get url of user's current tab
  chrome.tabs.query({
    active: true, currentWindow: true
  }, function(tabs) {
      let url_arr = [tabs[0].url];

      // Retrieve name array from chrome.storage
      chrome.storage.sync.get("names_arr", function(val) {
        let arr = val.names_arr;
        // Prompt user for new session name
        name = prompt_name(arr);

        // Update session in chrome.storage
        chrome.storage.sync.set({[name]: url_arr});

        // Update popup menu
        add_row(name);
      });
  });
}

// Saving current session (all tabs of window)
function save_session() {
  // Get all urls of user's current window
  chrome.tabs.query({
    currentWindow: true
  }, function(tabs) {
      let url_arr = [];
      tabs.forEach(function(tab) {
        url_arr.push(tab.url)
      });

      // Retrieve name array from chrome.storage
      chrome.storage.sync.get("names_arr", function(val) {
        let arr = val.names_arr;
        // Prompt user for new session name
        name = prompt_name(arr);

        // Update session in chrome.storage
        chrome.storage.sync.set({[name]: url_arr});

        // Update popup menu
        add_row(name);
      });
  });
}

// Opening settings HTML page
function open_settings() {
  // Open settings html page
  alert("settings pressed");
}

// Add a session row into the popup menu
function add_row(name) {
  // Inject row into popup
  let menu = document.getElementById("sessions-body");
  let div = document.createElement("div");
  div.id = name;
  div.innerHTML = name;
  div.className = "click-session";
  menu.appendChild(div);

  // Update previous state in chrome.storage
  let new_state = document.getElementById("sessions-body");
  chrome.storage.sync.set({"prev_state": new_state.outerHTML});

  // Update names array in chrome.storage
  chrome.storage.sync.get("names_arr", function(arr) {
    let names_arr = arr.names_arr;
    names_arr.push(name);
    chrome.storage.sync.set({"names_arr": names_arr});
  });
}

// Show form for session name
function prompt_name(arr) {
  let name = "";
  let cont = true;

  while(cont) {
    // Prompt for user input
    name = prompt("Please enter a unique name for this session.");
    
    // Boolean to keep track of finding duplicate name
    let same = false;
   
    // Check if name already exists in name array
    alert(arr);
    for (let i = 0; i < arr.length; i++) {
      // If name already exists, ask user for new name
      if (arr[i] == name) {
        alert("Session name already exists. Please enter a different name.");
        same = true;
        break;
      }
    }
    // If name does not match any preexisting names, return name
    if (!same) {
      return name;
    }
  }
}

// Right click on row to rename





///////////////////////////////////////////////////////////////////////////////////////////////////////
//-------------------------------------Event Listeners-----------------------------------------------//
///////////////////////////////////////////////////////////////////////////////////////////////////////

// Only create event listeners and restore popup after DOM has loaded
document.addEventListener("DOMContentLoaded", restore_user);
document.getElementById("save-tab").addEventListener("click", save_tab);
document.getElementById("save-session").addEventListener("click", save_session);
document.getElementById("settings").addEventListener("click", open_settings);

