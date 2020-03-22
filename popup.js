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
      document.getElementById("sessions").outerHTML = "";

      // Make dummy div to store inner HTML
      let div = document.createElement("div");
      div.innerHTML = state.prev_state;
      let new_state = div.firstChild;

      // Append state into correct position
      let anchor = document.getElementById("popup-body"); // Reference point for insertion
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
  document.getElementById("sessions-body").addEventListener("click", function(e){
    let obj = e.target;
    let obj_parent = obj.parentElement;
    // Loop through and open all tabs
    if (obj.className === "click-session" || obj.className === "text-span" || obj.className === "time-span") {
      let id = "";
      if (obj.className === "click-session") {
        id = obj.id;
      } else if (obj.className === "text-span" || obj.className === "time-span") {
        id = obj_parent.id;
      }
      
      chrome.storage.sync.get([id], function(val) {
        let arr = val[id];
        // Open tabs in new window
        chrome.windows.create({focused: true}, function(win) {
          arr.forEach(function(val) {
            chrome.tabs.create({
              url: val,
              windowId: win.id
            });
          // Maximize window for user
          chrome.windows.update(win.id, {state: "maximized"});
          });
          // Close default new tab that comes with new window
          chrome.tabs.query({
            lastFocusedWindow: true
          }, function(tabs) {
              chrome.tabs.remove(tabs[0].id);
            });
        });

        // Open tabs in same window
        // arr.forEach(function(val) {
        //   chrome.tabs.create({
        //     url: val
        //   });
        // });
      });

      // Update time last opened and prev_state
      let time_span = document.getElementById(id + "time");
      time_span.innerText = getTime();
      let new_state = document.getElementById("sessions");
      chrome.storage.sync.set({"prev_state": new_state.outerHTML});
    } // Edit session name
    else if (obj.className === "edit-button" || obj_parent.className === "edit-button") {
      let old_name = "";
      // obj_parent holds unique id
      if (obj.className === "edit-button") {
        old_name = obj_parent.id;
      } else { // obj_parent's parent holds unique id
        old_name = obj_parent.parentElement.id;
      }

      // Retrieve url array from chrome.storage under old name
      chrome.storage.sync.get([old_name], function(item) {
        let url_arr = item[old_name];
        // Retrieve name array from chrome.storage
        chrome.storage.sync.get("names_arr", function(val) {
          let arr = val.names_arr;

          // Prompt user for new session name
          new_name = prompt_name(arr);
          
          // Only update name and id if user did not press cancel
          if (new_name !== null) {
            // Update session in chrome.storage
            chrome.storage.sync.set({[new_name]: url_arr});

            // Update name within name_arr in chrome.storage
            // First remove old name and add new name
            arr.splice(arr.indexOf(old_name));
            arr.push(new_name);
            chrome.storage.sync.set({"names_arr": arr});

            // Update id of row
            let row = document.getElementById(old_name);
            row.id = new_name;

            // Update text of span in row and id of span
            let span = document.getElementById(old_name + "text");
            span.innerText = new_name;
            span.id = new_name + "text";

            // Update previous state in chrome.storage
            let new_state = document.getElementById("sessions-body");
            chrome.storage.sync.set({"prev_state": new_state.outerHTML});
          }
        });
      });
    } // Delete session
    else if (obj.className === "del-button" || obj_parent.className === "del-button") {
      // Ask for confirmation
      let bool = confirm("Are you sure you want to delete this session?");

      if (bool) {
        let old_name = "";
        // obj_parent holds unique id
        if (obj.className === "del-button") {
          old_name = obj_parent.id;
        } else { // obj_parent's parent holds unique id
          old_name = obj_parent.parentElement.id;
        }
  
        // Remove row from popup
        let div = document.getElementById(old_name);
        div.parentElement.removeChild(div);
        
        // Retrieve name array from chrome.storage
        chrome.storage.sync.get("names_arr", function(val) {
          let arr = val.names_arr;

          // Remove name from name_arr in chrome.storage
          arr.splice(arr.indexOf(old_name));
          chrome.storage.sync.set({"names_arr": arr});

          // Update previous state in chrome.storage
          let new_state = document.getElementById("sessions-body");
          chrome.storage.sync.set({"prev_state": new_state.outerHTML});
        });
      }
    }
  });
}

// General save function called by save_tab and save_window
function save(url_arr) {
  // Retrieve name array from chrome.storage
  chrome.storage.sync.get("names_arr", function(val) {
    let arr = val.names_arr;
    // Prompt user for new session name
    name = prompt_name(arr);
    
    // Only add row or update if user did not press cancel
    if (name !== "null") {
      // Update session in chrome.storage
      chrome.storage.sync.set({[name]: url_arr});

      // Update popup menu
      add_row(name);
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

      // Prompt user for input, update storage/popup
      save(url_arr);
    });
  }

// Saving current window (all tabs of window)
function save_window() {
  // Get all urls of user's current window
  chrome.tabs.query({
    currentWindow: true
  }, function(tabs) {
      let url_arr = [];
      tabs.forEach(function(tab) {
        url_arr.push(tab.url)
      });
      
      // Prompt user for input, update storage/popup
      save(url_arr);
  });
}

// Opening options HTML page
// Linking to options page
document.querySelector('#options').addEventListener("click", function() {
  console.log('options pressed')
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('./options.html'));
  }
});

// Add a session row into the popup menu
function add_row(name) {
  // If no session saved, remove sessions-empty div
  chrome.storage.sync.get("num_sessions", function(num) {
    if (num.num_sessions === 0) {
      let empty = document.getElementById("sessions-empty");
      empty.parentElement.removeChild(empty);
    }
    // Increment number of sessions
    chrome.storage.sync.set({"num_sessions": num.num_sessions + 1}, function() {
      let num_sessions = num.num_sessions + 1;

      // Inject row into top of the popup
      let menu = document.getElementById("sessions-body");
      let div = document.createElement("div");
      let text_span = document.createElement("span");
      text_span.id = name + "text";
      text_span.className = "text-span";
      text_span.innerText = name;
      div.appendChild(text_span);
      div.id = name;
      div.className = "click-session";

      // Add current time to session row
      let time_span = document.createElement("span");
      time_span.id = name + "time";
      time_span.className = "time-span";
      time_span.innerText = getTime();
      div.appendChild(time_span);

      // Delete button
      let del = document.createElement("button");
      del.className = "del-button";
      let i2 = document.createElement("i");
      i2.className = "fa fa-trash-o";
      del.appendChild(i2);
      div.appendChild(del);

      // Edit button
      let edit = document.createElement("button");
      edit.className = "edit-button";
      let i1 = document.createElement("i");
      i1.className = "fa fa-edit";
      edit.appendChild(i1);
      div.appendChild(edit);

      // Update sessions counter display
      let sessions_title = document.getElementById("sessions-title");
      sessions_title.innerText = "Saved Sessions: " + num_sessions;

      menu.insertBefore(div, menu.firstChild);

      // Update previous state in chrome.storage
      let new_state = document.getElementById("sessions");
      chrome.storage.sync.set({"prev_state": new_state.outerHTML});

      // Update names array in chrome.storage
      chrome.storage.sync.get("names_arr", function(arr) {
        let names_arr = arr.names_arr;
        names_arr.push(name);
        chrome.storage.sync.set({"names_arr": names_arr});
      });
    });
  });
}

// Get time in correct format
function getTime() {
  return Date().toLocaleString().substring(0, 21);
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
    for (let i = 0; i < arr.length; i++) {
      // If name already exists, ask user for new name
      if (arr[i] == name) {
        alert("Session name already exists. Please enter a different name.");
        same = true;
        break;
      }
    }
    
    // If name is empty string (pressed enter without any input), ask user for new name
    if (name === "") {
      alert("Please enter a non-empty name.");
      same = true;
    } else if (name.length > 20) {
      alert("Please enter a name with 20 characters or less.");
      same = true;
    }

    // If name does not match any preexisting names and is not empty, return name
    if (!same) {
      return name;
    }
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
//-------------------------------------Event Listeners-----------------------------------------------//
///////////////////////////////////////////////////////////////////////////////////////////////////////

// Only create event listeners and restore popup after DOM has loaded
document.addEventListener("DOMContentLoaded", restore_user);
document.getElementById("save-tab").addEventListener("click", save_tab);
document.getElementById("save-window").addEventListener("click", save_window);
// document.getElementById("options").addEventListener("click", open_options);

