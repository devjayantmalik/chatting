
// =======================
//	   Global Variables
// =======================

// STORE ALL SUBSCRIBED CHANNELS
let SUBSCRIBED_CHANNELS = []

// STORE LAST CHANNEL VISITED
let LAST_VISITED_CHANNEL_ID = localStorage.getItem('last_channel_visited');


window.addEventListener('DOMContentLoaded', channels_page_loaded);

function channels_page_loaded(){
	// get channel categories for create channel form.
	get_categories();

	// get subscribed channels
	sync_subscribed_channels();
}


function sync_subscribed_channels(){
	const request = new XMLHttpRequest();
	request.open('POST', '/channels/subscribed')
	request.setRequestHeader('AUTH_TOKEN', localStorage.getItem('secret_key'))

	// handle request response
	request.onload = () => {
		const res = request.responseText;

		if(res.success == false){
			show_error(res.error);
			return;
		}

		// update html page with channels.
		if(res.channels){
			res.channels.forEach(add_subscribed_channel);
		}

	}

	request.send()
}	

let channel_raw_html = document.querySelector("#channel-template").innerHTML;

function add_subscribed_channel(channel){
	channel_raw_html = channel_raw_html.replace('__channel_type__', 'subscribed')
	const content = sub_ch_template(channel);
	console.log(channel)

	document.querySelector('#channels').innerHTML += content;
}

function get_categories(){
	const req = new XMLHttpRequest()
	req.open('GET', '/channels/categories')

	req.onload = () => {
		let response = JSON.parse(req.responseText)

		if(response.success == false){
			show_error(response.error);
			return;
		}

		update_category_form(response.categories);
	}

	req.send()
}

function update_category_form(categories){
	
	let select = document.querySelector('#selectChannelCategory');

	categories.forEach(cat => {
		select.innerHTML += `<option value="${cat.id}">${cat.title}</option>`
	})
}