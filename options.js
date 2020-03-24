///////////////////////////////////////////////////////////////////////////////////////////////////////
//-------------------------------------Options Logic-------------------------------------------------//
///////////////////////////////////////////////////////////////////////////////////////////////////////

//Obtain html form elements
let confirmation_option = document.getElementById("option-1-input");
let close_tab_option = document.getElementById("option-2-input");
let close_window_option = document.getElementById("option-3-input");
let open_tab_option = document.getElementById("option-4-input");
let open_window_option = document.getElementById("option-5-input");
let open_session_option = document.forms["option-6"].elements["radio"];

//Store checkbox options inside array
let optionsList = [confirmation_option, close_tab_option, close_window_option, open_tab_option, open_window_option];


// Update html from value from preference_arr
setOption = () => {
    chrome.storage.sync.get("preference_arr", function(arr) {
        let preference_arr = arr.preference_arr;

        //Set checkbox values in html to preference_arr
        for (let i = 0; i < 5; i++ ) {
            optionsList[i].checked = preference_arr[i];
        }

        //Set radio value to preference_arr value
        switch (preference_arr[5]) {
            case 1:
                open_session_option[0].checked = true;
                break;
            case 2:
                open_session_option[1].checked = true;
                break;
            case 3:
                open_session_option[2].checked = true;
                break;
            default:
                open_session_option[0].checked = true;
                break;
        }
    });
}

// Initialize function at startup
setOption();

// Set chrome.storage value to input
changeOption = (key, val) => {
    chrome.storage.sync.get("preference_arr", function(arr) {
        let preference_arr = arr.preference_arr;

        preference_arr[key] = val;
        chrome.storage.sync.set({"preference_arr": preference_arr});
        setOption();
    });
};


confirmation_option.addEventListener('change', function() {
    if(this.checked) {
        changeOption(0, true);
    } else {
        changeOption(0, false);
    }
});

close_tab_option.addEventListener('change', function() {
    if(this.checked) {
        changeOption(1, true);
    } else {
        changeOption(1, false);
    }
});

close_window_option.addEventListener('change', function() {
    if(this.checked) {
        changeOption(2, true);
    } else {
        changeOption(2, false);
    }
});

open_tab_option.addEventListener('change', function() {
    if(this.checked) {
        changeOption(3, true);
    } else {
        changeOption(3, false);
    }
});

open_window_option.addEventListener('change', function() {
    if(this.checked) {
        changeOption(4, true);
    } else {
        changeOption(4, false);
    }
});

for(let j = 0, max = open_session_option.length; j < max; j++) {
    open_session_option[j].onclick = function() {
        if(open_session_option[j].checked) {
            changeOption(5, j+1);
        }
    }
}





