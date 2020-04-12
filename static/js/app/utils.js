
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

		document.location.href = "/login";

	}

	// send request
	request.send()
}