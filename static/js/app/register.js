
window.addEventListener('DOMContentLoaded', page_loaded);

function page_loaded(){
	// check if user is already logged in.
	check_login_status();

	// add the form submit event listener
	document.querySelector('#signup-form').onsubmit = form_submitted;
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

			// redirect the user to index page.
			document.location.href = "/";
		};

		// send the request
		request.send();
	} catch (err) {
		console.error(err);
	}
}

function form_submitted(event){
	// prevent page refresh
	event.preventDefault();

	// get the fname, lname, email, password, confirm password, location
	let fname = document.querySelector("#inputFname").value;
	let lname = document.querySelector("#inputLname").value;
	let email = document.querySelector("#inputEmail").value;
	let password = document.querySelector("#inputPassword").value;
	let confirm_password = document.querySelector("#inputConfirmPassword").value;
	let country = document.querySelector("#selectLocation").value;

	// check if fname and lname are more than 3 characters
	if(fname.length < 3 || lname.length < 3){
		show_error('First and last name should be more than 3 characters.')
		return;
	}

	// check if email is more than 9 characters
	if(email.length < 9){
		show_error("Email should be more than 9 characters.");
		return;
	}

	// check if password is more than 6 charactes
	if(password.length < 6){
		show_error("Password should be more than 6 characters.");
		return;
	}

	// check if password and confirm password match
	if(password != confirm_password){
		show_error("Passwords do not match.")
		return;
	}

	// check if location is selected.
	if(country == ""){
		show_error("Please select country.")
		return;
	}

	// create ajax request
	const request = new XMLHttpRequest()
	request.open("POST", "/auth/register");

	// handle the request complete
	request.onload = res => {
		let result = JSON.parse(res.target.responseText);
		if(result.success == false){
			show_error(result.error)
			return;
		}

		// get the secret key
		localStorage.setItem('secret_key', result.secret_key);

		// redirect to login
		document.location.href = "/login";
	}

	// prepare form data
	const form_data = new FormData();
	form_data.append('fname', fname)
	form_data.append('lname', lname)
	form_data.append('email', email)
	form_data.append('password', password)
	form_data.append('country', country)

	request.send(form_data);
}

