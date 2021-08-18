const shareButton = document.querySelector('.share-button');
const shareDialog = document.querySelector('.share-dialog');
const shareDialogOverlay = document.querySelector('.share-dialog-overlay');
const closeButton = document.querySelector('.close-button');

shareButton && shareButton.addEventListener('click', event => {
	var title = event.currentTarget.getAttribute('data-title');
    if (navigator.share) {
        navigator.share({
			title: title,
            url: document.location.href,
        }).then(() => {
            console.log('Thanks for sharing!');
        })
            .catch(console.error);
    } else {
        if (shareDialog) {
            shareDialog.classList.add('is-open');
			shareDialog.querySelector('.url').textContent = document.location.href;
			shareDialog.querySelector('.share-title').value = title;
        }
    }
});

closeButton && closeButton.addEventListener('click', event => {
    shareDialog.classList.remove('is-open');
});

shareDialogOverlay && shareDialogOverlay.addEventListener('click', event => {
	shareDialog.classList.remove('is-open');
});

if (shareDialog) {
    shareDialog.querySelector('.copy-link').addEventListener('click', function () {
        var textarea = document.createElement('textarea')
        textarea.id = 'temp_element'
        textarea.style.height = 0
        document.body.appendChild(textarea)
        textarea.value = shareDialog.querySelector('.url').textContent;
        var selector = document.querySelector('#temp_element')

        selector.select();
        document.execCommand("copy");

        var tooltip = shareDialog.querySelector('#copyTooltip');
        tooltip.innerHTML = "Copied: " + textarea.value;

        document.body.removeChild(textarea)
    });

    shareDialog.querySelector('.copy-link').addEventListener('mouseout', function () {
        var tooltip = shareDialog.querySelector('#copyTooltip');
        tooltip.innerHTML = "Copy to clipboard";
    });
}

var share = {};
share.share = function (target) {
	share.functions[target](shareDialog.querySelector('.share-title').value);
}

share.functions = {
	mailto: function (title) {
		var url = 'mailto:?subject=' + encodeURIComponent(title || 'Check this out!') + '&body=' + encodeURIComponent('Thought you might enjoy this: ') + encodeURIComponent(window.location.href);
		//if (!!title) url += encodeURIComponent(' - ') + encodeURIComponent(title);

		window.location.href = url;
	},
	twitter: function (title) {
		var url = 'https://twitter.com/home?status=';
		url += encodeURIComponent(title || '') + encodeURIComponent(window.location.href);

		share.popup(url);
	},
	pinterest: function (title) {
		var url = 'https://pinterest.com/pin/create/bookmarklet/?is_video=false';
		//url += '&media=' + encodeURIComponent(root.options.image);
		url += '&url=' + encodeURIComponent(window.location.href);
		if (title) url += '&description=' + encodeURIComponent(title);

		share.popup(url);
	},
	facebook: function (title) {
		var url = 'https://www.facebook.com/sharer/share.php?';
		url += 'u=' + encodeURIComponent(window.location.href);
		if (!!title) url += '&title=' + encodeURIComponent(title);

		share.popup(url);
	}
}

// open share link in a popup
share.popup = function (url) {
	// set left and top position
	var popupWidth = 500,
		popupHeight = 400,
		// fix dual screen mode
		dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left,
		dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top,
		width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width,
		height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height,
		// calculate top and left position
		left = ((width / 2) - (popupWidth / 2)) + dualScreenLeft,
		top = ((height / 2) - (popupHeight / 2)) + dualScreenTop,

		// show popup
		shareWindow = window.open(url, 'targetWindow', 'toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=' + popupWidth + ', height=' + popupHeight + ', top=' + top + ', left=' + left);

	// Puts focus on the newWindow
	if (window.focus) {
		shareWindow.focus();
	}
}
