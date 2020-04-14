
window.addEventListener('DOMContentLoaded', () => {
	// avatar on left top of page.
	document.querySelector("#page-top-avatar").src = localStorage.getItem('user_avatar');

	// users settings panel.
	document.querySelector("#user-settings-avatar").src = localStorage.getItem('user_avatar');
	document.querySelector("#user-settings-fname").value = localStorage.getItem('user_fname');
	document.querySelector("#user-settings-lname").value = localStorage.getItem('user_lname');
	document.querySelector("#user-settings-email").value = localStorage.getItem('user_email');
	document.querySelector("#user-settings-country").value = localStorage.getItem('user_country');

});