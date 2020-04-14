

window.addEventListener('DOMContentLoaded', () => {
	// get all friend requests
	get_friend_requests();
})

const get_friend_requests = () => {
	const request = new XMLHttpRequest();
	request.open('post', '/friends/requests')
	request.setRequestHeader('AUTH_TOKEN', localStorage.getItem('secret_key'));

	// handle the request response
	request.onload = () => {
		const response = JSON.parse(request.responseText);

		if(response.success == false){
			show_error(response.error);
			return;
		}
		// display notification
		response.requests.forEach(add_request_notification);

	}

	request.send();
}


function add_request_notification(notification){
	console.log(notification);
	// get the request template
	// displays notification in left sidebar
	const list_template = Handlebars.compile(document.querySelector("#notification-list-template").innerHTML);

	// displays screen to accept or reject friend request.
	const show_template = Handlebars.compile(document.querySelector("#notification-show-template").innerHTML);

	const list_content = list_template(notification);

	// add user info to notification
	notification.user_fname = localStorage.getItem('user_fname')
	notification.user_lname = localStorage.getItem('user_lname')

	const show_content = show_template(notification);

	// display the notification in list.
	document.querySelector("#alerts").innerHTML += list_content;

	// add the display notification
	document.querySelector("#nav-tabContent").innerHTML += show_content;

}

function toggleFriendNotification(id){
	// remove show from all chats
	document.querySelectorAll('.babble').forEach(chat => chat.classList.remove('show'));
	document.querySelectorAll('.babble').forEach(chat => chat.classList.remove('active'));


	// get the chat
	let chat = document.querySelector(`#friendRequest${id}`);

	// set the chat to be visible
	if(!chat.classList.contains('show')){
		chat.classList.add('show')
	}
	if(!chat.classList.contains('active')){
		chat.classList.add('active')
	}
}

function acceptFriendRequest(id){
	const request = new XMLHttpRequest();
	request.open('post', `/friends/confirm/${id}`);
	request.setRequestHeader('AUTH_TOKEN', localStorage.getItem('secret_key'));

	request.onload = () => {
		let res = JSON.parse(request.responseText);

		if(res.success == false){
			show_info(res.error);
			return;
		}

		show_info("Friend added successfully. Please reload page to update your contacts.");
	}

	request.send();
}

function rejectFriendRequest(id){
	const request = new XMLHttpRequest();
	request.open('post', `/friends/reject/${id}`);
	request.setRequestHeader('AUTH_TOKEN', localStorage.getItem('secret_key'));

	request.onload = () => {
		let res = JSON.parse(request.responseText);

		if(res.success == false){
			show_info(res.error);
			return;
		}

		show_info("Friend request rejected successfully.");
	}

	request.send();	
}