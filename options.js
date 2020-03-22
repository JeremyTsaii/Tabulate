var checkbox = document.querySelector("input[type=checkbox]");

checkbox.addEventListener( 'change', function() {
    if(this.checked) {
        console.log("checked");
    } else {
        console.log("not checked");
    }
});