///////////////////////////////////////////////////////////////////////////////////////////////////////
//----------------------------------------Edit Logic-------------------------------------------------//
///////////////////////////////////////////////////////////////////////////////////////////////////////

// Display all links within clicked session
function set_rows() {
  chrome.storage.sync.get("last_clicked", function(str) {
    let old_name = str.last_clicked;

    // Update edit title
    document.getElementById("edit-title").innerText = old_name;

    // Retrieve url arry from chrome.storage under old name
    chrome.storage.sync.get([old_name], function(item) {
      let url_arr = item[old_name];

      // Update link title
      document.getElementById("link-title").innerText = `Saved Links: ${url_arr.length}`;

      // Insert links in url_arr as rows appended to edit-body 
      url_arr.forEach(append_link);

      // Add event listener to session rows
      // Timeout to let popup load
      setTimeout(add_listener, 500); 
    });
  });
}

function append_link(link) {
  // Anchor for appending row
  let body = document.getElementById("edit-body");

  // Create row div
  let div = document.createElement("div");

  div.id = link;
  div.className = "click-session-edit";

  //Create p tag to display URL
  let link_text = document.createElement("p");
  link_text.className = "link-text";
  link_text.innerText = link;
  
  // Delete button
  let del = document.createElement("button");
  del.className = "link-delete";
  let i = document.createElement("i");
  i.className = "fa fa-trash-o";
  del.appendChild(i);
  div.appendChild(link_text);
  div.appendChild(del);
  body.appendChild(div);
}

// Event listener for clicking on a link row
function add_listener() {
  document.getElementById("edit-body").addEventListener("click", function(e){
    let obj = e.target;
    let obj_parent = obj.parentElement;

    // User clicked on link row
    if (obj.className === "click-session-edit") {
      open_link(obj);
    } else if (obj.className === "link-delete" || obj.className === "fa fa-trash-o") { // Delete link row
      del_link(obj_parent);
    }
  });
}

// Open tab of corresponding link row
function open_link(obj) {
  chrome.tabs.create({
    url: obj.id
  });
}

// Delete link row
function del_link(obj_parent) {
  chrome.storage.sync.get("preference_arr", function(arr) {
    let conf = arr.preference_arr[0];
    let bool = true;

    // Ask for confirmation only if preference_arr has true value
    if (conf) {
      bool = confirm("Are you sure you want to delete this link?");
    }

    if (bool) {
      let name = document.getElementById("edit-title").innerText;
      let link = obj_parent.id;
      let link2 = obj_parent.parentElement.id;

      // Find correct link id depending on if icon or button was pressed
      if (link.length === 0) {
        link = link2;
      }
      
      // Remove link from array and update chrome storage
      chrome.storage.sync.get([name], function(item) {
        let url_arr = item[name];
        url_arr.splice(url_arr.indexOf(link), 1);

        // If no more links, delete session 
        if (url_arr.length === 0) {
          // Remove session name from name_arr
          chrome.storage.sync.get("names_arr", function(arr) {
            let names_arr = arr.names_arr;
            names_arr.splice(names_arr.indexOf(name), 1);
            chrome.storage.sync.set({"names_arr": names_arr});

            // Update session counter
            chrome.storage.sync.get("num_sessions", function(num) {
              chrome.storage.sync.set({"num_sessions": num.num_sessions - 1});

              let num_sessions = num.num_sessions - 1;
              
              // Update previous state
              chrome.storage.sync.get("prev_state", function(state) {
                // Make dummy div to store inner HTML
                let div = document.createElement("div");
                div.innerHTML = state.prev_state;
          
                // Get session rows
                let old_state = div.firstChild;
                let sessions = old_state.childNodes[3].childNodes;
          
                // Loop through session rows to find correct div
                let row = null;
                for (let i = 0; i < sessions.length; i++) {
                  if (sessions[i].id === name) {
                    row = sessions[i];
                    break;
                  }
                }
              
              // Remove session name from popup state
              row.outerHTML = "";

              // Update session counter in popup state
              let counter = old_state.childNodes[1];
              counter.innerText = `Saved Sessions: ${num_sessions}`;

              // Replace session-empty div text if 0 sessions
              if (num_sessions === 0) {
                let empty = document.createElement("div");
                empty.id = "sessions-empty";
                empty.innerText = "No saved sessions yet. Click on the save buttons above to get started!";
                old_state.appendChild(empty);
              }

              // Update previous state in chrome.storage
              chrome.storage.sync.set({"prev_state": old_state.outerHTML});
              });
            });
          // Go back to main popup page
          window.location.href = "popup.html";
          });
        } else {
          // Delete row from edit page
          let div = document.getElementById(link);
          div.parentElement.removeChild(div);

          // Update link counter for edit screen
          document.getElementById("link-title").innerText = `Saved Links: ${url_arr.length}`;

          // Update tab counter for popup
          update_counter(name, url_arr);
        }
      });
    }
  });
}

// Change name of current session
function edit_name(){
  let old_name = document.getElementById("edit-title").innerText;
  
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
        arr.splice(arr.indexOf(old_name), 1);
        arr.push(new_name);
        chrome.storage.sync.set({"names_arr": arr});

        chrome.storage.sync.get("prev_state", function(state) {
          // Make dummy div to store inner HTML
          let div = document.createElement("div");
          div.innerHTML = state.prev_state;

          // Get session rows
          let old_state = div.firstChild;
          let sessions = old_state.childNodes[3].childNodes;

          // Loop through session rows to find correct div
          let row = null;
          for (let i = 0; i < sessions.length; i++) {
            if (sessions[i].id === old_name) {
              row = sessions[i];
              break;
            }
          }

          // Update id of row
          row.id = new_name;

          // Update text of text span in row and id of text span 
          let text_span = row.childNodes[0];
          text_span.innerText = new_name;
          text_span.id = new_name + "text";

          // Update id of time span
          let time_span = row.childNodes[1];
          time_span.id = new_name + "time";

          // Update id of count span
          let count_span = row.childNodes[2];
          count_span.id = new_name + "count";

          // Update previous state in chrome.storage
          chrome.storage.sync.set({"prev_state": old_state.outerHTML});

          // Update edit title
          document.getElementById("edit-title").innerText = new_name;
        });
      }
    });
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

// Add current tab to session
function add_link() {
  // Get id to use for chrome storage
  let name = document.getElementById("edit-title").innerText;

  // Get array containing links of current session
  chrome.storage.sync.get([name], function(arr) {
    let url_arr = arr[name];

    // Get current tab and add to url_arr
    chrome.tabs.query({
      active: true, currentWindow: true
    }, function(tabs) {
        let link = tabs[0].url;
        url_arr.push(link);

        // Add row to edit screen
        append_link(link);

        // Update counter in popup state
        update_counter(name, url_arr);
      });
  });
}


// Update the session counter within the state stored in chrome storage according to length of url_arr
function update_counter(name, url_arr) {
  // Update array of links in chrome storage
  chrome.storage.sync.set({[name]: url_arr}, function() {
    // Update link counter
    document.getElementById("link-title").innerText = `Saved Links: ${url_arr.length}`;

    // Update prev_state tab counter
    chrome.storage.sync.get("prev_state", function(state) {
      // Make dummy div to store inner HTML
      let div = document.createElement("div");
      div.innerHTML = state.prev_state;

      // Get session rows
      let old_state = div.firstChild;
      let sessions = old_state.childNodes[3].childNodes;

      // Loop through session rows to find correct div
      let row = null;
      for (let i = 0; i < sessions.length; i++) {
        if (sessions[i].id === name) {
          row = sessions[i];
          break;
        }
      }
    
    // Update tab counter of count span
    let count_span = row.childNodes[2];
    count_span.innerText = `| Tabs: ${url_arr.length}`;

    // Update previous state in chrome.storage
    chrome.storage.sync.set({"prev_state": old_state.outerHTML});
    });
  });
}

set_rows();

///////////////////////////////////////////////////////////////////////////////////////////////////////
//-------------------------------------Event Listeners-----------------------------------------------//
///////////////////////////////////////////////////////////////////////////////////////////////////////

// Navigates back to popup.html on click of arrow button
document.getElementById("edit-back").addEventListener("click", () => {
  window.location.href = "popup.html";
});

// Edit name of session on click of edit button
document.getElementById("edit-name").addEventListener("click", edit_name);

// Add current tab on click of plus button
document.getElementById("add-link").addEventListener("click", add_link);
