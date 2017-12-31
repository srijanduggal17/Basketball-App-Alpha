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

database.ref("/teamslist/" + localStorage.currentteam + "/schedule/")
		.once("value",function(schedule) {
			for (const event in schedule.val()) {

				if (schedule.val()[event]["Event"] === "Game") {
					let inputdate = schedule.val()[event]["Date"];
					let splitdate = inputdate.split("-");
					let inputendtime = schedule.val()[event]["End Time"];
					let splitendtime = inputendtime.split(":");
					let input = new Date(splitdate[0], parseInt(splitdate[1]) - 1, splitdate[2], splitendtime[0],splitendtime[1]);
					let gametime = input.getTime();

					if (gametime > timenow && gametime < nextgame[1]) {
						nextgame = [event, gametime];
					}
				}
				if (schedule.val()[event]["Event"] === "Practice") {
					let inputdate = schedule.val()[event]["Date"];
					let splitdate = inputdate.split("-");
					let inputendtime = schedule.val()[event]["End Time"];
					let splitendtime = inputendtime.split(":");
					let input = new Date(splitdate[0], parseInt(splitdate[1]) - 1, splitdate[2], splitendtime[0],splitendtime[1]);
					let practicetime = input.getTime();

					if (practicetime > timenow && practicetime < nextpractice[1]) {
						nextpractice = [event, practicetime];
					}
				}
			}

			var gametitle = document.createElement('h1');
			gametitle.innerHTML = "Next Game";
			var practicetitle = document.createElement('h1');
			practicetitle.innerHTML = "Next Practice";

			if (nextgame[1] >= nextpractice[1]) {
				if (nextgame[1] != future.getTime()) {
					let gameopp = document.createElement('p');
					let gamedate = document.createElement('p');
					let gametime = document.createElement('p');
					let gameloc = document.createElement('p');
					gameopp.innerHTML = "Opponent: " + capitalizeName(schedule.val()[nextgame[0]]["Opponent"]);
					gamedate.innerHTML = "Date of game: " + schedule.val()[nextgame[0]].Date;
					gametime.innerHTML = "Time: " + schedule.val()[nextgame[0]]["Start Time"] + " - " + schedule.val()[nextgame[0]]["End Time"];
					gameloc.innerHTML = "Location: " + capitalizeName(schedule.val()[nextgame[0]]["Location"]);
					event2.appendChild(gametitle);
					event2.appendChild(gameopp);
					event2.appendChild(gamedate);
					event2.appendChild(gametime);
					event2.appendChild(gameloc);
					event2.setAttribute('data-key',nextgame[0]);
					event2.addEventListener("click",homePage);
				}
				else {
					let gameinfo = document.createElement('p');
					gameinfo.innerHTML = "No upcoming games";
					event2.appendChild(gametitle);
					event2.appendChild(gameinfo);
				}
				if (nextpractice[1] != future.getTime()) {
					let practicedate = document.createElement('p');
					let practicetime = document.createElement('p');
					let practiceloc = document.createElement('p');
					practicedate.innerHTML = "Date of practice: " + schedule.val()[nextpractice[0]].Date;
					practicetime.innerHTML = "Time: " + schedule.val()[nextpractice[0]]["Start Time"] + " - " + schedule.val()[nextpractice[0]]["End Time"];
					practiceloc.innerHTML = "Location: " + capitalizeName(schedule.val()[nextpractice[0]]["Location"]);
					event1.appendChild(practicetitle);
					event1.appendChild(practicedate);
					event1.appendChild(practicetime);
					event1.appendChild(practiceloc);
					event1.setAttribute('data-key', nextpractice[0]);
					event1.addEventListener("click", homePage);
				}
				else {
					let practiceinfo = document.createElement('p');
					practiceinfo.innerHTML = "No upcoming practices";
					event1.appendChild(practicetitle);
					event1.appendChild(practiceinfo);
				}
			}
			else {
				if (nextgame[1] != future.getTime()) {
					let gameopp = document.createElement('p');
					let gamedate = document.createElement('p');
					let gametime = document.createElement('p');
					let gameloc = document.createElement('p');
					gameopp.innerHTML = "Opponent: " + capitalizeName(schedule.val()[nextgame[0]]["Opponent"]);
					gamedate.innerHTML = "Date of game: " + schedule.val()[nextgame[0]].Date;
					gametime.innerHTML = "Time: " + schedule.val()[nextgame[0]]["Start Time"] + " - " + schedule.val()[nextgame[0]]["End Time"];
					gameloc.innerHTML = "Location: " + capitalizeName(schedule.val()[nextgame[0]]["Location"]);
					event1.appendChild(gametitle);
					event1.appendChild(gameopp);
					event1.appendChild(gamedate);
					event1.appendChild(gametime);
					event1.appendChild(gameloc);
					event1.setAttribute('data-key', nextgame[0]);
					event1.addEventListener("click", homePage);
				}
				else {
					let gameinfo = document.createElement('p');
					gameinfo.innerHTML = "No upcoming games";
					event1.appendChild(gametitle);
					event1.appendChild(gameinfo);
				}
				if (nextpractice[1] != future.getTime()) {
					let practicedate = document.createElement('p');
					let practicetime = document.createElement('p');
					let practiceloc = document.createElement('p');
					practicedate.innerHTML = "Date of practice: " + schedule.val()[nextpractice[0]].Date;
					practicetime.innerHTML = "Time: " + schedule.val()[nextpractice[0]]["Start Time"] + " - " + schedule.val()[nextpractice[0]]["End Time"];
					practiceloc.innerHTML = "Location: " + capitalizeName(schedule.val()[nextpractice[0]]["Location"]);
					event2.appendChild(practicetitle);
					event2.appendChild(practicedate);
					event2.appendChild(practicetime);
					event2.appendChild(practiceloc);
					event2.setAttribute('data-key', nextpractice[0]);
					event2.addEventListener("click",homePage);
				}
				else {
					let practiceinfo = document.createElement('p');
					practiceinfo.innerHTML = "No upcoming practices";
					event2.appendChild(practicetitle);
					event2.appendChild(practiceinfo);
				}
			}
		}
		,function (error) {
			console.error("Schedule information not pulled from database");
		    console.log(error.message);
		    console.log("Error code: " + error.code);
		});

function homePage() {
	console.log("event clicked");
	localStorage.setItem("currentevent", [this.childNodes[1].innerHTML.substr(5), this.dataset.key]);
	window.location.href = "../HTML/data_setup.html";
}