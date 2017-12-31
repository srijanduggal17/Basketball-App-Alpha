var statustable = document.getElementById("statustable");
var eventtype = localStorage.currentevent.split(",")[0].toLowerCase() + "s";
var eventkey = localStorage.currentevent.split(",")[1];

document.getElementById("continuebutton").addEventListener("click", saveStatus);

firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		//User is signed in
		currentUser = user;
		console.log("user signed in");
		console.log(currentUser.uid);

		database.ref('/teamslist/' + localStorage.currentteam + '/players/').once("value", function(playerslist) {
			//What if there are no players
			//Show mesage and link to add players

			for (const player in playerslist.val()) {
				let newrow = statustable.insertRow();
				newrow.id = player;

				let newname = newrow.insertCell();
				newname.innerHTML = playerslist.val()[player]["Name"];

				let newstatussection = newrow.insertCell();

				let injuredbutton = document.createElement('button');
				injuredbutton.innerHTML = "Injured";
				injuredbutton.addEventListener("click", selectStatus);
				newstatussection.appendChild(injuredbutton);

				let absentbutton = document.createElement('button');
				absentbutton.innerHTML = "Absent";
				absentbutton.addEventListener("click", selectStatus);
				newstatussection.appendChild(absentbutton);

				let practicingbutton = document.createElement('button');
				practicingbutton.innerHTML = "Practicing";

				if (eventtype === "games") {
					let benchbutton = document.createElement('button');
					benchbutton.innerHTML = "Bench";
					benchbutton.addEventListener("click", selectStatus);
					newstatussection.appendChild(benchbutton);

					practicingbutton.innerHTML = "Playing";					
				}

				practicingbutton.addEventListener("click", selectStatus);
				newstatussection.appendChild(practicingbutton);

				statustable.appendChild(newrow);
			}
		}, function (error) {
			console.error("Player list not pulled from database");
			console.log(error.message);
		 	console.log("Error code: " + error.code);
		});
	}
	else {
		//No user is signed in
		console.log("user is not signed in");
		window.location.href = "../HTML/sign_in_up.html";
	}
});

function selectStatus() {
	this.parentNode.parentNode.setAttribute("data-status", this.innerHTML);
	this.parentNode.parentNode.childNodes[1].childNodes[0].style.background = "none";
	this.parentNode.parentNode.childNodes[1].childNodes[1].style.background = "none";
	this.parentNode.parentNode.childNodes[1].childNodes[2].style.background = "none";
	if (eventtype === "Games") {
		this.parentNode.parentNode.childNodes[1].childNodes[3].style.background = "none";	
	}
	this.style.background = "green";
}

function saveStatus() {
	let updates = {};
	for (var i = 1; i < statustable.rows.length; i++) {
		let currentplayer = statustable.rows[i].id;
		let currentstatus = statustable.rows[i].dataset.status;

		updates[currentplayer] = currentstatus;
	}

	database.ref('/teamslist/' + localStorage.currentteam + '/' + eventtype + '/' + eventkey + '/Player Status/')
		.update(updates)
		.then(() => {
			console.log("Player status updated");
			window.location.href = "../HTML/data_entry.html"
		})
		.catch(error => {
			console.error("Player status not updated");
			console.log(error.message);
			console.log("Error code: " + error.code);
		});
}