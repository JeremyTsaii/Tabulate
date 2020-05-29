///////////////////////////////////////////////////////////////////////////////////////////////////////
//-------------------------------------Button Logic--------------------------------------------------//
///////////////////////////////////////////////////////////////////////////////////////////////////////

// Restore previous state of popup (sessions and user preferences) stored in chrome.storage when new tab is opened
function restore_user() {
  // Restore popup HTML with previous state
  chrome.storage.sync.get("prev_state", function (state) {
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

  // Add event listener to session rows
  // Timeout to let popup load
  setTimeout(add_listener, 500);
}

// Event listener for clicking on different parts of a session row
function add_listener() {
  document
    .getElementById("sessions-body")
    .addEventListener("click", function (e) {
      let obj = e.target;
      let obj_parent = obj.parentElement;

      // Loop through and open all tabs
      if (
        obj.className === "click-session" ||
        obj.className === "text-span" ||
        obj.className === "info-span"
      ) {
        open(obj, obj_parent);
      } // Edit session name
      else if (
        obj.className === "edit-button" ||
        obj_parent.className === "edit-button"
      ) {
        edit(obj, obj_parent);
      } // Delete session
      else if (
        obj.className === "del-button" ||
        obj_parent.className === "del-button"
      ) {
        del(obj, obj_parent);
      }
    });
}

// Open tabs of session
function open(obj, obj_parent) {
  let id = "";
  if (obj.className === "click-session") {
    id = obj.id;
  } else if (obj.className === "text-span" || obj.className === "info-span") {
    id = obj_parent.id;
  }

  chrome.storage.sync.get("preference_arr", function (pref_arr) {
    let open_action = pref_arr.preference_arr[5];

    // Close current tab
    if (open_action === 2) {
      chrome.tabs.query(
        {
          active: true,
          currentWindow: true,
        },
        function (tabs) {
          chrome.tabs.remove(tabs[0].id);
        }
      );
    } else if (open_action === 3) {
      // Close all tabs
      chrome.tabs.query(
        {
          currentWindow: true,
        },
        function (tabs) {
          setTimeout(function () {
            tabs.forEach(function (tab) {
              chrome.tabs.remove(tab.id);
            });
          }, 250);
        }
      );
    }

    let cur_win = true;
    chrome.storage.sync.get([id], function (val) {
      let arr = val[id];
      // Single tab
      if (arr.length == 1) {
        cur_win = pref_arr.preference_arr[3];
      } else {
        // Multiple tabs
        cur_win = pref_arr.preference_arr[4];
      }

      // Open tabs in new window
      if (!cur_win) {
        chrome.windows.create({ focused: true }, function (win) {
          arr.forEach(function (val) {
            chrome.tabs.create({
              url: val,
              windowId: win.id,
            });
            // Maximize window for user
            chrome.windows.update(win.id, { state: "maximized" });
          });
          // Close default new tab that comes with new window
          chrome.tabs.query(
            {
              lastFocusedWindow: true,
            },
            function (tabs) {
              chrome.tabs.remove(tabs[0].id);
            }
          );
        });
      } else {
        // Open tabs in current window
        arr.forEach(function (val) {
          chrome.tabs.create({
            url: val,
          });
        });
      }
    });
  });

  // Update time last opened and prev_state
  let info_span = document.getElementById(id + "info");
  info_span.innerText = getTime() + info_span.innerText.substring(15);
  update_state();
}

// Edit name of session
function edit(obj, obj_parent) {
  let old_name = "";
  // obj_parent holds unique id
  if (obj.className === "edit-button") {
    old_name = obj_parent.id;
  } else {
    // obj_parent's parent holds unique id
    old_name = obj_parent.parentElement.id;
  }

  chrome.storage.sync.set({ last_clicked: old_name }, function () {
    window.location.href = "edit.html";
  });
}

// Delete session
function del(obj, obj_parent) {
  chrome.storage.sync.get("preference_arr", function (arr) {
    let conf = arr.preference_arr[0];
    let bool = true;

    // Ask for confirmation only if preference_arr has true value
    if (conf) {
      bool = confirm("Are you sure you want to delete this session?");
    }

    if (bool) {
      chrome.storage.sync.get("num_sessions", function (num) {
        // Decrement number of sessions
        chrome.storage.sync.set(
          { num_sessions: num.num_sessions - 1 },
          function () {
            // Update session counter
            let num_sessions = num.num_sessions - 1;
            let sessions_title = document.getElementById("sessions-title");
            sessions_title.innerText = "Saved Sessions: " + num_sessions;

            let old_name = "";
            // obj_parent holds unique id
            if (obj.className === "del-button") {
              old_name = obj_parent.id;
            } else {
              // obj_parent's parent holds unique id
              old_name = obj_parent.parentElement.id;
            }

            // Remove row from popup
            let div = document.getElementById(old_name);
            div.parentElement.removeChild(div);

            // If 0 session remaining, replace sessions-empty div
            if (num_sessions === 0) {
              let empty = document.createElement("div");
              empty.id = "sessions-empty";
              empty.innerText =
                "No saved sessions yet. Click on the save buttons above to get started!";
              let anchor = document.getElementById("sessions");
              anchor.appendChild(empty);
            }

            // Retrieve name array from chrome.storage
            chrome.storage.sync.get("names_arr", function (val) {
              let arr = val.names_arr;

              // Remove name from name_arr in chrome.storage
              arr.splice(arr.indexOf(old_name), 1);
              chrome.storage.sync.set({ names_arr: arr });

              // Update previous state in chrome.storage
              update_state();
            });
          }
        );
      });
    }
  });
}

// Update previous state within chrome storage
function update_state() {
  let new_state = document.getElementById("sessions");
  chrome.storage.sync.set({ prev_state: new_state.outerHTML });
}

// General save function called by save_tab and save_window
function save(url_arr) {
  // Retrieve name array from chrome.storage
  chrome.storage.sync.get("names_arr", function (val) {
    let arr = val.names_arr;
    // Prompt user for new session name
    name = prompt_name(arr);

    // Only add row or update if user did not press cancel
    if (name !== "null") {
      // Update session in chrome.storage
      chrome.storage.sync.set({ [name]: url_arr }, function () {
        // Update popup menu
        add_row(name, url_arr);
      });
    }
  });
}

// Saving current tab and updating popup
function save_tab() {
  // Get url of user's current tab
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    function (tabs) {
      let url_arr = [tabs[0].url];

      // Prompt user for input, update storage/popup
      save(url_arr);

      // Close current tab if preferences correspond
      close(true, tabs);
    }
  );
}

// Saving current window (all tabs of window)
function save_window() {
  // Get all urls of user's current window
  chrome.tabs.query(
    {
      currentWindow: true,
    },
    function (tabs) {
      let url_arr = [];
      tabs.forEach(function (tab) {
        url_arr.push(tab.url);
      });

      // Prompt user for input, update storage/popup
      save(url_arr);

      // Close current window if preferences correspond
      close(false, tabs);
    }
  );
}

// Close current tab/window depending on parameter passed in
// true for closing tab, false for closing window
function close(bool, tabs) {
  chrome.storage.sync.get("preference_arr", function (pref_arr) {
    let close = true;

    // Close current tab
    if (bool) {
      close = pref_arr.preference_arr[1];

      if (close) {
        setTimeout(function () {
          chrome.tabs.remove(tabs[0].id);
        }, 500);
      }
    } else {
      // Close current window
      close = pref_arr.preference_arr[2];

      if (close) {
        setTimeout(function () {
          tabs.forEach(function (tab) {
            chrome.tabs.remove(tab.id);
          });
        }, 500);
      }
    }
  });
}

// Opening options HTML page
document.getElementById("options").addEventListener("click", function () {
  window.location.href = "options.html";
});

// Add a session row into the popup menu
function add_row(name, url_arr) {
  // If no session saved, remove sessions-empty div
  chrome.storage.sync.get("num_sessions", function (num) {
    if (num.num_sessions === 0) {
      let empty = document.getElementById("sessions-empty");
      empty.parentElement.removeChild(empty);
    }
    // Increment number of sessions
    chrome.storage.sync.set(
      { num_sessions: num.num_sessions + 1 },
      function () {
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

        // Add current item and links counter to session row
        let info_span = document.createElement("span");
        info_span.id = name + "info";
        info_span.className = "info-span";
        info_span.innerText = getTime() + " " + `| Tabs: ${url_arr.length}`;
        div.appendChild(info_span);

        // Edit button
        let edit = document.createElement("button");
        edit.className = "edit-button";
        let i1 = document.createElement("i");
        i1.className = "fa fa-edit";
        edit.appendChild(i1);
        div.appendChild(edit);

        // Delete button
        let del = document.createElement("button");
        del.className = "del-button";
        let i2 = document.createElement("i");
        i2.className = "fa fa-trash-o";
        del.appendChild(i2);
        div.appendChild(del);

        // Update sessions counter display
        let sessions_title = document.getElementById("sessions-title");
        sessions_title.innerText = "Saved Sessions: " + num_sessions;

        menu.insertBefore(div, menu.firstChild);

        // Update previous state in chrome.storage
        update_state();

        // Update names array in chrome.storage
        chrome.storage.sync.get("names_arr", function (arr) {
          let names_arr = arr.names_arr;
          names_arr.push(name);
          chrome.storage.sync.set({ names_arr: names_arr });
        });
      }
    );
  });
}

// Get time in correct format
function getTime() {
  return new Date().toDateString();
}

// Show form for session name
function prompt_name(arr) {
  let name = "";
  let cont = true;

  while (cont) {
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
