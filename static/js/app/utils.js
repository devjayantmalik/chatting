
window.addEventListener('DOMContentLoaded', () => {
	const secret_key = localStorage.getItem('secret_key');
	if(!secret_key){
		document.location.href = "/login";
		return;
	}

	if(secret_key == "null" && document.location.pathname == "/" ){
		document.location.href = "/login";
		return;
	}
})

/*
function show_error(message){
	// set the toast error message
	document.querySelector("#error").innerHTML = message;

	// display the toast
	$('#error-toast').toast('show');
}
*/

function show_error(message){
	console.log(message);
}

function show_info(message){
	console.log(message);
}


function logout(){
	

	// create request
	const request = new XMLHttpRequest();
	request.open('post', '/auth/logout')
	request.setRequestHeader('AUTH_TOKEN', localStorage.getItem('secret_key'))

	request.onload = () => {
		const res = JSON.parse(request.responseText);

		if(res.success == false){
			show_error(res.error);
			return;
		}

		// clear the localstorage key
		localStorage.setItem('secret_key', null);
		document.location.href = "/login";

	}

	// send request
	request.send()
}
