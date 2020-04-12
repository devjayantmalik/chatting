
// =======================
//	   Global Variables
// =======================

// STORE ALL SUBSCRIBED CHANNELS
let SUBSCRIBED_CHANNELS = []

// STORE LAST SYNC DATE
let LAST_SYNC = null;

// STORE LAST FETCHED MESSAGE ID
let LAST_FETCHED = 0;

// STORE LAST CHANNEL VISITED
let LAST_VISITED_CHANNEL_ID = null;


window.addEventListener('DOMContentLoaded', load);

function load(){
	// configure global
	configure_global();

	if(LAST_SYNC == null){
		sync_subscribed_channels();

		localStorage.setItem('last_channels_sync', Date());
		LAST_SYNC = localStorage.getItem('last_channels_sync');
	}

	// watch for channels announcements


}


function sync_subscribed_channels(){}