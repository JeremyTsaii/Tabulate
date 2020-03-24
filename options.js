let confirmation_option = document.getElementById("option-1-input");
let close_tab_option = document.getElementById("option-2-input");
let open_tab_option = document.getElementById("option-3-input");
let open_window_option = document.getElementById("option-4-input");
let open_session_option = document.getElementById("option-5-input");

// confirmation_option.checked = true;
// close_tab_option.checked = false;
// open_tab_option.checked = false;
// open_window_option.checked = true;
// open_session_option.checked = false;

let optionsList = [confirmation_option, close_tab_option, open_tab_option, open_window_option, open_session_option];

setOption = () => {
    chrome.storage.sync.get("preference_arr", function(arr) {
        let preference_arr = arr.preference_arr;
        for (var i = 0; i < 5; i++ ) {
            optionsList[i].checked = preference_arr[i];
        }
    });
}

setOption();


changeOption = (key, val) => {
    chrome.storage.sync.get("preference_arr", function(arr) {
        let preference_arr = arr.preference_arr;

        preference_arr[key] = val;
        chrome.storage.sync.set({"preference_arr": preference_arr});
        setOption();
    });
};

confirmation_option.addEventListener( 'change', function() {
    if(this.checked) {
        changeOption(0, true);
    } else {
        changeOption(0, false);
    }
});

close_tab_option.addEventListener( 'change', function() {
    if(this.checked) {
        changeOption(1, true);
    } else {
        changeOption(1, false);
    }
});

open_tab_option.addEventListener( 'change', function() {
    if(this.checked) {
        changeOption(2, true);
    } else {
        changeOption(2, false);
    }
});

open_window_option.addEventListener( 'change', function() {
    if(this.checked) {
        changeOption(3, true);
    } else {
        changeOption(3, false);
    }
});

open_session_option.addEventListener( 'change', function() {
    if(this.checked) {
        changeOption(4, true);
    } else {
        changeOption(4, false);
    }
});


