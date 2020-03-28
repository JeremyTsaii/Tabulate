
// Display all links within clicked session
function set_rows() {
  chrome.storage.sync.get("last_clicked", function(str) {
    let old_name = str.last_clicked;

    // Update edit title
    document.getElementById("edit-title").innerText = old_name;

    // Retrieve url arry from chrome.storage under old name
    chrome.storage.sync.get([old_name], function(item) {
      let url_arr = item[old_name];
      let body = document.getElementById("edit-body");

      // Update link title
      document.getElementById("link-title").innerText = `Saved Links: ${url_arr.length}`;

      // Insert links in url_arr as rows appended to edit-body 
      url_arr.forEach(function(link) {
        let div = document.createElement("div");
        div.id = link;
        div.innerText = link;
        div.className = "click-session";
        
        // Delete button
        let del = document.createElement("button");
        del.className = "link-delete";
        let i = document.createElement("i");
        i.className = "fa fa-trash-o";
        del.appendChild(i);
        div.appendChild(del);

        body.appendChild(div);

        // Add event listener to session rows
        // Timeout to let popup load
      });

      setTimeout(add_listener, 500); 
    });
  });
}

// Event listener for clicking on a link row
function add_listener() {
  document.getElementById("edit-body").addEventListener("click", function(e){
    let obj = e.target;
    let obj_parent = obj.parentElement;
    
    // Open tab
    chrome.tabs.create({
      url: obj.id
    });
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
        arr.splice(arr.indexOf(old_name));
        arr.push(new_name);
        chrome.storage.sync.set({"names_arr": arr});

        chrome.storage.sync.get("prev_state", function(state) {
          // Make dummy div to store inner HTML
          let div = document.createElement("div");
          div.innerHTML = state.prev_state;

          // Get session rows
          let old_state = div.firstChild;
          let sessions = old_state.childNodes;
          alert(old_state.childNodes[1].innerHTML);
          alert(old_state.childNodes[3].childNodes[0].innerHTML);
          
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
          let text_span = div.getElementById(old_name + "text");
          text_span.innerText = new_name;
          text_span.id = new_name + "text";

          // Update id of time span
          let time_span = div.getElementById(old_name + "time");
          time_span.id = new_name + "time";

          // Update id of count span
          let count_span = div.getElementById(old_name + "count");
          count_span.id = new_name + "count";

          // Update previous state in chrome.storage

          chrome.storage.sync.set({"prev_state": new_state});

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
