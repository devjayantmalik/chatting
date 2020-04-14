
window.addEventListener('DOMContentLoaded', page_loaded);

function page_loaded(){
	// check is user is already logged in.
	check_login_status();

	// add the form submit event.
	document.querySelector('#login-form').onsubmit = login_form_submitted;
	
}

function check_login_status() {
	try {
		const secret_key = localStorage.getItem("secret_key");

		// if user is not logged in
		if (!secret_key) return;
		if(secret_key.length < 10) return;

		// create ajax request
		const request = new XMLHttpRequest();

		// prepare the request
		request.open("POST", "/auth/login");
		request.setRequestHeader("AUTH_TOKEN", secret_key);

		// handle the request response
		request.onload = (res) => {
			// get the response
			const result = JSON.parse(res.target.responseText);

			if (result.success == false) {
				show_error(res.error);
				return;
			}

			console.log(result);

			// redirect the user to index page.
			document.location.href = "/";
		};

		// send the request
		request.send();
	} catch (err) {
		console.error(err);
	}
}
function login_form_submitted(event){
	// prevent page from refresh
	event.preventDefault();

	// get the email
	let email = document.querySelector("#inputEmail").value

	// get the password
	let password = document.querySelector("#inputPassword").value

	// make sure email is more than 9 characters
	if(email.length < 9){
		show_error('Email should be more than 9 characters.')
		return;
	}

	// make sure password is more than 6 characters.
	if(password.length < 6){
		show_error("Password should be more than 6 characters.")
		return;
	}

	// Create ajax request
	let request = new XMLHttpRequest()
	request.open('POST', '/auth/login')

	// handle the response
	request.onload = res => {
		const result = JSON.parse(res.target.responseText);
		if(!result.success){
			show_error(result.error)
			return;
		}

		// store the user in localhost
		localStorage.setItem('secret_key', result.user.secret_key);
		localStorage.setItem('user_id', result.user.id)
		localStorage.setItem('user_avatar', result.user.avatar)
		localStorage.setItem('user_fname', result.user.fname)
		localStorage.setItem('user_lname', result.user.lname)
		localStorage.setItem('user_email', result.user.email)
		localStorage.setItem('user_country', result.user.country)

		// redirect to index page.
		document.location.href = "/";

	}

	// prepare the request data
	let form_data = new FormData();
	form_data.append('email', email);
	form_data.append('password', password);

	// send the request
	request.send(form_data);
}

function logout(){
	// create request
	const request = new XMLHttpRequest();
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