var checkbox1 = document.querySelector(".option-1-input");

changeOption = (key, val) => {
    chrome.storage.sync.get("preference_arr", function(arr) {
        let preference_arr = arr.preference_arr;

        preference_arr[key] = val;
        chrome.storage.sync.set({"preference_arr": preference_arr});
        console.log(preference_arr);
      });
};

checkbox1.addEventListener( 'change', function() {
    if(this.checked) {
        changeOption(0, true);
    } else {
        changeOption(0, false);
    }
});





