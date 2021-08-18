function showSnackBar(text) {
    var snackbar = document.createElement('div')
    snackbar.id = 'snackbar'
    document.body.appendChild(snackbar)

    snackbar.innerText = text;

    // Add the "show" class to DIV
    snackbar.className = "show";

    // After 3 seconds, remove the show class from DIV
    setTimeout(function () {
        snackbar.className = snackbar.className.replace("show", "");
        setTimeout(function () {
            document.body.removeChild(snackbar);
        }, 1000);
    }, 9000);
}