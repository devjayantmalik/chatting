

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


function add_request_notification(){
	// get the request template
	const list_template = document.querySelector("#notification-list-template").innerHTML;
	const list_template = document.querySelector("#notification-show-template").innerHTML;
}