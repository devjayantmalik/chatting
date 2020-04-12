"use strict";

// ===============================
//		Global Variables
// ===============================

// ALL CONTACTS
let ALL_CONTACTS = [];

// ===============================
//		Functions
// ===============================
window.addEventListener("DOMContentLoaded", load);

function load() {
	sync_contacts();

	// update the html page with offline data.
	update_html_page();

	// handle the create contact form submit event.
	document.querySelector(
		"#create-contact-form"
	).onsubmit = create_new_contact;
}

function create_new_contact(e) {
	// prevent page refresh
	e.preventDefault();

	// get the required information
	const friend_email = document.querySelector("#create-contact-email").value;
	const message = document.querySelector("#create-contact-message").value;

	// check if friend with provided id exists
	const request = new XMLHttpRequest();
	request.open("POST", `/friends/search/${friend_email}`);
	request.setRequestHeader("AUTH_TOKEN", localStorage.getItem("secret_key"));

	let friend = null;
	request.onload = () => {
		let res = JSON.parse(request.responseText);
		if (res.success == false) {
			show_error(res.error);
			return;
		}

		// get the friend id
		const friend_id = res.user.id;

		// create ajax request
		const request2 = new XMLHttpRequest();
		request2.open("POST", `/friends/send/${friend_id}`);
		request2.setRequestHeader(
			"AUTH_TOKEN",
			localStorage.getItem("secret_key")
		);

		request2.onload = () => {
			// get the user information
			const response = JSON.parse(request2.responseText);

			if (response.success === false) {
				show_error(response.error);
				return;
			}

			show_info("Request sent successfully.");
		};

		// send request
		request2.send();
	};

	request.send();
}

function sync_contacts() {

	// create a request
	let request = new XMLHttpRequest();
	request.open("POST", "/friends/all");
	request.setRequestHeader("AUTH_TOKEN", localStorage.getItem("secret_key"));

	// on request completion add new contacts.
	request.onload = () => {
		console.log(request.responseText);
		// get the contacts
		const result = JSON.parse(request.responseText);

		if (result.success == false) {
			show_error(result.error);
			return;
		}

		const contacts = result.friends;

		// update the global contacts list
		ALL_CONTACTS = contacts;

		// update the html content.
		update_html_page();
	};

	// make the ajax request.
	request.send();
}

function update_html_page() {
	ALL_CONTACTS.forEach(add_new_contact);
}

// ===============================
//		Templates Compilation
// ===============================

// compile contact template
const template = Handlebars.compile(
	document.querySelector("#contact-template").innerHTML
);

function add_new_contact(contact) {
	// generate html using template
	const content = template(contact);

	// get the html page.
	let dom = document.querySelector("#contacts");

	// append the content to the html element
	dom.innerHTML += content;
}
