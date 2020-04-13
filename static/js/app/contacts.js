"use strict";

// ===============================
//		Functions
// ===============================
window.addEventListener("DOMContentLoaded", contacts_page_loaded);

function contacts_page_loaded() {
	sync_contacts();

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
		// get the contacts
		const result = JSON.parse(request.responseText);

		if (result.success == false) {
			show_error(result.error);
			return;
		}

		const contacts = result.friends;

		// update the global contacts list
		contacts.forEach(add_new_contact);
		
		// update contact chat
		contacts.forEach(get_contact_chat);

	};

	// make the ajax request.
	request.send();
}


// ===============================
//		Templates Compilation
// ===============================

// compile contact template
let contacts_raw_html = document.querySelector("#contact-template").innerHTML;

function add_new_contact(contact) {
	// generate html using template
	const template = Handlebars.compile(contacts_raw_html);
	const content = template(contact);

	// append the content to the html element
	document.querySelector("#contacts").innerHTML += content;
}

function get_contact_chat(contact){
	const request = new XMLHttpRequest();
	request.open('POST', `/friends/chats/${contact.id}`);
	request.setRequestHeader("AUTH_TOKEN", localStorage.getItem('secret_key'))

	request.onload = () => {
		const res = JSON.parse(request.responseText);

		if(res.success == false){
			show_error(res.error);
			return;
		}

		render_contact_chats(contact, res.chats)
	}

	// send request
	request.send();
}


// utility function to group json objects by values.
const groupBy = array => array.reduce((objectsByKeyValue = {}, obj) => {
	  	const value = obj['short_date']
	    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
	    return objectsByKeyValue;
	  }, {});


function render_contact_chats(contact, chats){
	// render the contact chat header
	let header_raw_html = document.querySelector("#contact-chat-header-template").innerHTML;
	let header_template = Handlebars.compile(header_raw_html);
	let header_content = header_template(contact);

	// render the chats
	let messages_raw_html = document.querySelector("#contact-chat-message-template").innerHTML;
	let messages_template = Handlebars.compile(messages_raw_html);

	// sort the chats
	chats.sort((a, b) => (parseInt(a.id) - parseInt(b.id)));

	// add dates to messages
	const dates_modified_chats = chats.map(chat => {
		// add short date and time
		chat.short_date = new Date(chat.sent_at).toDateString()
		chat.short_time = new Date(chat.sent_at).toLocaleTimeString()

		// check if message is sent by me or received by me.
		let my_id = parseInt(localStorage.getItem('user_id'));
		chat.is_sent_by_me = (parseInt(my_id) === parseInt(chat.sender_id)) ? true : false;
		return chat;
	})

	// group chats by sent date
	let grouped_chats = groupBy(dates_modified_chats);
	
	// store html messages by date
	let messages_content = [];

	// create seperate lists of chats per date
	let dates = Object.keys(grouped_chats);
	for(let i=0; i < dates.length; ++i){
		// get date
		let date = dates[i];

		// get all messages per date
		let messages = grouped_chats[date];

		// generate html content.
		let content = messages_template({
			"date": date,
			"messages": messages
		})

		// push to messages_content
		messages_content.push(content);
	}

	// combine header and chats
	let chat_container = Handlebars.compile(document.querySelector("#chat-tab").innerHTML);

	let content = chat_container({
		"id": contact.id,
		"header": header_content,
		"messages": messages_content
	})

	// update the html page
	document.querySelector("#nav-tabContent").innerHTML += content;

}

const toggleChat = (id) => {
	// remove show from all chats
	document.querySelectorAll('.babble').forEach(chat => chat.classList.remove('show'));
	document.querySelectorAll('.babble').forEach(chat => chat.classList.remove('active'));


	// get the chat
	let chat = document.querySelector(`#contactChat${id}`);

	// set the chat to be visible
	if(!chat.classList.contains('show')){
		chat.classList.add('show')
	}
	if(!chat.classList.contains('active')){
		chat.classList.add('active')
	}
}