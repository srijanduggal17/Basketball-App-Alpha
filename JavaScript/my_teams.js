//Makes database reference
var currentUser;
var teamsdiv = document.getElementById("teamsdiv");
var currentorgobj = database.ref('/organizationslist/' + localStorage.currentorganization);

var deletebutton = document.getElementById("deletebutton");
deletebutton.addEventListener("click", deleteTeams);
var donebutton = document.getElementById("donebutton");
donebutton.addEventListener("click", done);
var candelete = false;
document.getElementById("createteam").addEventListener("click", createTeam);
var newteambutton = document.getElementById("newteambutton");
newteambutton.addEventListener("click", newTeam);
var myorgsbutton = document.getElementById("myorgsbutton");
myorgsbutton.addEventListener("click", myOrgs);

var permdelete;

//Checks if user is signed in
firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		//User is signed in
		currentUser = user;
		console.log("user signed in");
		console.log(user.uid);

		currentorgobj.once("value", function(currentorg) {
			if (currentorg.val()["owner"] === user.uid) {
				permdelete = true;
			}
			else {
				permdelete = false;
				deletebutton.style.display = "none";
			}
			document.getElementById("orgname").innerHTML = currentorg.val()["name"];
			if (currentorg.val()["teams"] === undefined) {
				document.getElementById("messagediv").style.display = "block";
				deletebutton.style.display = "none";
				donebutton.style.display = "none";
				newteambutton.style.display = "none";
			}
			else {
				for (const team in currentorg.val()["teams"]) {
					console.log(team);
					let newdiv = document.createElement('div');
					newdiv.setAttribute('class', 'teamdiv');
					newdiv.addEventListener("click", teamPage);
					let newtext = document.createElement('p');

					database.ref('/teamslist/' + currentorg.val()["teams"][team])
						.once("value", function(teamobj) {
							newtext.innerHTML = teamobj.val().teamname;
						}, function (error) {
							console.error("Team object not pulled");
							console.log(error.message);
							console.log("Error code: " + error.code);
						});
					newdiv.setAttribute('id', currentorg.val()["teams"][team]);
					newdiv.appendChild(newtext);
					teamsdiv.appendChild(newdiv);
				}
			}
		}, function (error) {
			console.error("Current organization object not pulled");
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

function teamPage() {
	if (!candelete) {
		localStorage.setItem("currentteam",this.id);
		window.location.href = "../HTML/home.html";
		console.log("going to team page");
	}

	else if (candelete) {
		let selectedteam = this;
		selectedteam.style.background = "blue";

		setTimeout(() => {
			let response;
			response = confirm("Are you sure you want to delete this team?");

			if (response) {
				selectedteam.remove();
				database.ref('/teamslist/' + selectedteam.id).remove();

				let orgsteams = database.ref('/organizationslist/' + localStorage.currentorganization + '/teams/');
				orgsteams.once("value", function(teamsinorg) {
					let numofteams = 0;
					let endloop = false;
					for (const team in teamsinorg.val()) {
						if (endloop) {
							break;
						}
						numofteams++;
						if (teamsinorg.val()[team] === selectedteam.id) {
							orgsteams.child(team)
								.remove()
								.then(() => {
									if (numofteams === 1) {
										console.log("No teams");
										document.getElementById("messagediv").style.display = "block";
										deletebutton.style.display = "none";
										donebutton.style.display = "none";
										newteambutton.style.display = "none";

										let updates = {};
										updates['/organizationslist/' + localStorage.currentorganization + '/complete/'] = false;
										updates['/orgteamstatus/' + currentUser.uid + '/1/'] = false;

										database.ref()
											.update(updates)
											.then(() => {
												endloop = true;
												console.log("Organization updated to incomplete and orgteamstatus[1] set to false");
											})
											.catch(error => {
												console.error("Organization not updated to incomplete / orgteamstatus[1] not set to false");
												console.log(error.message);
												console.log("Error code: " + error.code);
											});
									}								
								})
								.catch(function(error) {
									console.error("Team not removed from organization");
									console.log(error.message);
									console.log("Error code: " + error.code);
								});
						}
					}
				}, function (error) {
					console.error("Organization's teams not pulled from database");
					console.log(error.message);
					console.log("Error code: " + error.code);
				});
			}
			else if (!response) {
				selectedteam.style.background = "none";
			}
		},75);
	}
}

function deleteTeams() {
	candelete = true;
	donebutton.style.display = "inline-block";
	deletebutton.style.display = "none";
	newteambutton.style.display = "none";
	myorgsbutton.style.display = "none";
}

function done() {
	candelete = false;
	donebutton.style.display = "none";
	if (permdelete) {
		deletebutton.style.display = "inline-block";	
	}
	myorgsbutton.style.display = "inline-block";
	newteambutton.style.display = "inline-block";
}

function createTeam() {
	window.location.href = "../HTML/create_team.html"
}

function newTeam() {
	database.ref('/orgteamstatus/' + currentUser.uid + '/1/')
		.set(false)
		.then(() => {
			console.log('orgteamstatus[1] set to false');
			localStorage.setItem("teamstatus", "+");
			window.location.href = "../HTML/create_team.html";
		})
		.catch(error => {
			console.log('orgteamstatus[1] not set to false');
			console.log(error.message);
			console.log("Error code: " + error.code);
		});
}

function myOrgs() {
	localStorage.removeItem("currentorganization");
	window.location.href = "../HTML/my_organizations.html";
}