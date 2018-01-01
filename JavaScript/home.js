var current = new Date();
var future =  new Date(2028,11,31);

var timenow = current.getTime();

var nextgame = [null, future.getTime()];
var nextpractice = [null, future.getTime()];

var event1 = document.getElementById("event1");
var event2 = document.getElementById("event2");

firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		//User is signed in
		currentUser = user;
		console.log("user signed in");  
	}
	else {
		//No user is signed in
		console.log("user is not signed in");
		window.location.href = "../HTML/sign_in_up.html";
	}
});

function makeEventDiv(evtype, evnum, nextev, title, sched) {
	let newopp = document.createElement('p');
	let newdate = document.createElement('p');
	let newtime = document.createElement('p');
	let newloc = document.createElement('p');

	if (evtype === "Game") {
		newopp.innerHTML = "Opponent: " + capitalizeName(sched[nextev[0]]["Opponent"]);
		evnum.appendChild(newopp);
	}

	newdate.innerHTML = "Date of " + evtype + ": " + sched[nextev[0]].Date;
	newtime.innerHTML = "Time: " + sched[nextev[0]]["Start Time"] + " - " + sched[nextev[0]]["End Time"];
	newloc.innerHTML = "Location: " + capitalizeName(sched[nextev[0]]["Location"]);	

	evnum.appendChild(title);
	evnum.appendChild(newdate);
	evnum.appendChild(newtime);
	evnum.appendChild(newloc);
	evnum.setAttribute('data-key',nextev[0]);
	evnum.addEventListener("click",homePage);
}

function newAlterDiv(evtype, evnum, title) {
	let newinfo = document.createElement('p');
	newinfo.innerHTML = "No upcoming " + evtype;
	evnum.appendChild(title);
	evnum.appendChild(newinfo);
}

function findNextEvent(sched) {
	for (const event in sched) {

		if (sched[event]["Event"] === "Game") {
			let inputdate = sched[event]["Date"];
			let splitdate = inputdate.split("-");
			let inputendtime = sched[event]["End Time"];
			let splitendtime = inputendtime.split(":");
			let input = new Date(splitdate[0], parseInt(splitdate[1]) - 1, splitdate[2], splitendtime[0],splitendtime[1]);
			let gametime = input.getTime();

			if (gametime > timenow && gametime < nextgame[1]) {
				nextgame = [event, gametime];
			}
		}
		if (sched[event]["Event"] === "Practice") {
			let inputdate = sched[event]["Date"];
			let splitdate = inputdate.split("-");
			let inputendtime = sched[event]["End Time"];
			let splitendtime = inputendtime.split(":");
			let input = new Date(splitdate[0], parseInt(splitdate[1]) - 1, splitdate[2], splitendtime[0],splitendtime[1]);
			let practicetime = input.getTime();

			if (practicetime > timenow && practicetime < nextpractice[1]) {
				nextpractice = [event, practicetime];
			}
		}
	}
}

function makeEvents(ev1, ev2, sched) {
	let gametitle = document.createElement('h1');
	gametitle.innerHTML = "Next Game";
	let practicetitle = document.createElement('h1');
	practicetitle.innerHTML = "Next Practice";

	if (nextgame[1] != future.getTime()) {
		makeEventDiv("game", ev1, nextgame, gametitle, sched);
	}
	else {
		newAlterDiv("games", ev1, gametitle);
	}
	if (nextpractice[1] != future.getTime()) {
		makeEventDiv("practice", ev2, nextpractice, practicetitle, sched);
	}
	else {
		newAlterDiv("practices", ev2, practicetitle);
	}
}

database.ref("/teamslist/" + localStorage.currentteam + "/schedule/")
		.once("value",function(schedule) {
			findNextEvent(schedule.val());

			if (nextgame[1] >= nextpractice[1]) {
				makeEvents(event2, event1, schedule.val());
			}
			else {
				makeEvents(event1, event2, schedule.val());
			}
		}, function (error) {
			console.error("Schedule information not pulled from database");
		    console.log(error.message);
		    console.log("Error code: " + error.code);
		});

function homePage() {
	console.log("event clicked");
	localStorage.setItem("currentevent", [this.childNodes[1].innerHTML.substr(5), this.dataset.key]);
	window.location.href = "../HTML/data_setup.html";
}