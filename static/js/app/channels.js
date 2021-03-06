
// =======================
//	   Global Variables
// =======================

window.addEventListener('DOMContentLoaded', channels_page_loaded);

function channels_page_loaded(){
	// get channel categories for create channel form.
	get_categories();

	// get subscribed channels
	sync_subscribed_channels();

	// get public channels
	get_public_channels();

	// bind create channel form
	document.querySelector("#create-channel-form").onsubmit = create_new_channel;

	// create socket
	var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

	// working with web sockets.
	socket.on('connect', () => {
		console.log("socket connected successfully.");
	});

	socket.on('channel new chat', data => {
		if(data.sender_id == localStorage.getItem('user_id')){
			sent_by_me(data.channel_id, data.message);
		}
		else{
			sent_by_someone_else(data);
		}
	});
}


function sync_subscribed_channels(){
	const request = new XMLHttpRequest();
	request.open('POST', '/channels/subscribed')
	request.setRequestHeader('AUTH_TOKEN', localStorage.getItem('secret_key'))

	// handle request response
	request.onload = () => {
		const res = JSON.parse(request.responseText);

		if(res.success == false){
			show_error(res.error);
			return;
		}

		// update html page with channels.
		res.channels.forEach(add_subscribed_channel);

		// get channel chats.
		res.channels.forEach(get_channel_chat);

	}

	request.send()
}	


function add_subscribed_channel(channel){
	// update the short date
	channel.created_on = new Date(channel.created_on).toDateString();

	let channel_raw_html = document.querySelector("#channel-template").innerHTML;
	channel_raw_html = channel_raw_html.replace('__channel_type__', 'subscribed')
	let sub_ch_template = Handlebars.compile(channel_raw_html);
	const content = sub_ch_template(channel);

	// update html content.
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

function create_new_channel(e){
	// prevent page refresh
	e.preventDefault();

	// get the form data
	let channel_name = document.querySelector("#inputChannelName").value;
	let channel_category = document.querySelector("#selectChannelCategory").value;
	let channel_description = document.querySelector("#inputChannelMessage").value;

	// validate form data
	if(channel_name.length < 2 || channel_name.length > 20){
		show_error("Channel name should not be more than 20 characters.");
		return;
	}

	if(!channel_category){
		show_error("Please select channel category.");
		return;
	}

	if(channel_description.length > 100){
		show_error("Channel description should not be more than 100 characters.");
		return;
	}

	// create ajax request
	const request = new XMLHttpRequest();
	request.open('POST', '/channels/create')
	request.setRequestHeader('AUTH_TOKEN', localStorage.getItem('secret_key'));

	request.onload = () => {
		const res = JSON.parse(request.responseText);

		if(res.success == false){
			show_error(res.error);
			return;
		}

		// add to subscribed channels list
		add_subscribed_channel(res.channel);
		show_info('Channel created successfully.');
	}

	// create form data
	let form_data = new FormData();
	form_data.append('name', channel_name);
	form_data.append('category', channel_category);
	form_data.append('description', channel_description);

	request.send(form_data);

}

function update_category_form(categories){
	
	let select = document.querySelector('#selectChannelCategory');

	categories.forEach(cat => {
		select.innerHTML += `<option value="${cat.id}">${cat.title}</option>`
	})
}


// =====================================
// =====================================
// =====================================
// =====================================
// =====================================

function get_channel_chat(channel){
	const request = new XMLHttpRequest();
	request.open('POST', `/channels/chats/public/${channel.id}`);
	request.setRequestHeader("AUTH_TOKEN", localStorage.getItem('secret_key'))

	request.onload = () => {
		const res = JSON.parse(request.responseText);
		if(res.success == false){
			show_error(res.error);
			return;
		}

		render_channel_chats(channel, res.chats)
	}

	// send request
	request.send();
}


// utility function to group json objects by values.
const group_channels_by_date = array => array.reduce((objectsByKeyValue = {}, obj) => {
	  	const value = obj['short_date']
	    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
	    return objectsByKeyValue;
	  }, {});


function render_channel_chats(channel, chats){
	// render the contact chat header
	let header_raw_html = document.querySelector("#channel-chat-header-template").innerHTML;
	let header_template = Handlebars.compile(header_raw_html);
	let header_content = header_template(channel);
	// render the chats
	let messages_raw_html = document.querySelector("#channel-chat-message-template").innerHTML;
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
	let grouped_chats = group_channels_by_date(dates_modified_chats);
	
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
	let chat_container = Handlebars.compile(document.querySelector("#channel-chat-tab").innerHTML);

	let content = chat_container({
		"id": channel.id,
		"header": header_content,
		"messages": messages_content
	})

	// update the html page
	document.querySelector("#nav-tabContent").innerHTML += content;

	// toggle last channel chat if present
	let last_visited = localStorage.getItem('last_channel_visited');
	if(last_visited != "null" || !last_visited){
		toggleChannelChat(last_visited);
	}
}

const toggleChannelChat = (id) => {

	// store current channel as last channel
	localStorage.setItem('last_channel_visited', id);

	// remove show from all chats
	document.querySelectorAll('.babble').forEach(chat => chat.classList.remove('show'));
	document.querySelectorAll('.babble').forEach(chat => chat.classList.remove('active'));


	// get the chat
	let chat = document.querySelector(`#channelChat${id}`);

	// set the chat to be visible
	if(!chat.classList.contains('show')){
		chat.classList.add('show')
	}
	if(!chat.classList.contains('active')){
		chat.classList.add('active')
	}
}


// ==================================
// ==================================
// ==================================
// ==================================

function send_channel_message(id){
	let message = document.querySelector("#channel-form-message"+id);
	
	const request = new XMLHttpRequest();
	request.open('post', '/channels/chats/send/'+id);
	request.setRequestHeader('AUTH_TOKEN', localStorage.getItem('secret_key'));

	let form_data = new FormData();
	form_data.append('message', message.value);

	request.onload = () => {
		const res = JSON.parse(request.responseText);
		if(res.status == false){
			show_error(res.error);
			return;
		}

		// clear the chat message box
		message.value = "";
	}


	request.send(form_data)
}


function sent_by_me(id, message){
	// append the messages to the chat
		document.querySelector('#channel-messages-'+id).innerHTML += `
				<div class="message me">
					<div class="text-main">
						<div class="text-group me">
							<div class="text me">
								<p>
									${message}
								</p>
							</div>
						</div>
						<span>${new Date().toLocaleTimeString()}</span>
					</div>
				</div>`;
}

function sent_by_someone_else(data){
	// update the html webpage
	document.querySelector('#channel-messages-'+data.channel_id).innerHTML += 
	`<div class="message">
					<img
						class="avatar-md"
						src="${data.sender_avatar}"
						data-toggle="tooltip"
						data-placement="top"
						title="${data.sender_fname} ${data.sender_lname}"
						alt="avatar"
					/>
					<div class="text-main">
						<div class="text-group">
							<div class="text">
								<p>
									${data.message}
								</p>
							</div>
						</div>
						<span>
							${new Date(data.sent_at).toLocaleTimeString()}
						</span>
					</div>
				</div>`
}

function get_public_channels(){
	const req = new XMLHttpRequest();
	req.open('post', '/channels/public')
	req.setRequestHeader("AUTH_TOKEN", localStorage.getItem('secret_key'))

	req.onload = () => {
		// get the response
		let response = JSON.parse(req.responseText);

		if(response.success == false){
			show_error(response.error);
			return;
		}

		// add new channel.
		response.channels.forEach(add_public_channel);

		// get the chats of the channel
		response.channels.forEach(get_channel_chat);

	}

	req.send();
}

function add_public_channel(channel){
	// update the short date
	channel.created_on = new Date(channel.created_on).toDateString();

	let channel_raw_html = document.querySelector("#channel-template").innerHTML;
	channel_raw_html = channel_raw_html.replace('__channel_type__', 'public')
	let sub_ch_template = Handlebars.compile(channel_raw_html);
	const content = sub_ch_template(channel);

	// update html content.
	document.querySelector('#channels').innerHTML += content;	
}