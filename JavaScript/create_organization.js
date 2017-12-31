//Link buttons to functions
document.getElementById("neworganization").addEventListener("click", newOrganization);
document.getElementById("myorganization").addEventListener("click", myOrg);
document.getElementById("signout").addEventListener("click", signOut);

var currentUser;

var pagestatus = true;
var allowedtext = /^[a-zA-Z ']+$/;

//Asterisk variables
var levelaster = document.getElementById("levelaster");
var schoolaster = document.getElementById("schoolaster");
var locationaster = document.getElementById("locationaster");

var myorgref;

firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		//User is signed in
		currentUser = user;
		myorgref = database.ref('/users/' + currentUser.uid + '/organizations/');
		console.log("user signed in");
		console.log(currentUser.uid);
	}
	else {
		//No user is signed in
		console.log("user is not signed in");
		window.location.href = "../HTML/sign_in_up.html";
	}
});

if (localStorage.orgstatus === "+") {
	document.getElementById("myorganization").style.display = "inline-block";
}

function newOrganization() {
	//Get values of input fields
	var school = document.getElementById('school').value;
	var location = document.getElementById('location').value;
	var level = "";

	if(document.getElementById('levelCO').checked) {
		level = "CO";
		levelaster.style.display = "none";
	}
	else if(document.getElementById('levelHS').checked) {
		level = "HS";
		levelaster.style.display = "none";
	}
	else {
		pagestatus = false;
		levelaster.style.display = "inline";
	}

	if (school === "" || school.match(allowedtext) === null) {
		schoolaster.style.display = "inline";
		pagestatus = false;
	}
	else {
		schoolaster.style.display = "none";
	}

	if (location === "" || location.match(allowedtext) === null) {
		locationaster.style.display = "inline";
		pagestatus = false;
	}
	else {
		locationaster.style.display = "none";
	}

	//Push organization to database
	if (pagestatus) {
		let neworganization = {
			owner: currentUser.uid,
			location: capitalizeName(location),
			name: capitalizeName(school),
			level: level,
			complete: false,
			numofmembers: 1,
			members: {
				0: currentUser.uid
			}
		};

		let pushkey = database.ref('/organizationslist/').push().key;
		let updates = {};
		updates[pushkey] = neworganization;

		//Push organization to organization list
		let pushorg = database.ref('/organizationslist/')
			.update(updates)
			.then(() => {
				console.log('Organization pushed to organizationslist');
			});

		let pushtouser = database.ref('/users/' + currentUser.uid + '/organizations/')
			.push(pushkey)
			.then(() => {
				console.log("Organization pushed to user");
				
			});

		Promise.all([pushorg, pushtouser])
			.then(() => {
				//Set orgstatus as true
				if (localStorage.orgstatus === "+") {
					database.ref('/orgteamstatus/' + currentUser.uid)
						.set({
							0: "true+",
							1: false
						})
						.then(() => {
							console.log("Orgteamstatus updated to: " + ["true+", false]);
							localStorage.removeItem("orgstatus");
							localStorage.setItem("currentorganization",pushkey)
							window.location.href = "../HTML/create_team.html";
						})
						.catch(error => {
							console.error("Orgteamstatus not updated to: " + ["true+", false]);
							console.log(error.message);
							console.log("Error code: " + error.code);
						});
				}

				else {
					database.ref('/orgteamstatus/' + currentUser.uid + '/0/')
						.set(true)
						.then(() => {
							console.log("Orgteamstatus[0] updated to true");
							localStorage.setItem("currentorganization",pushkey)
							window.location.href = "../HTML/create_team.html";
						})
						.catch(error => {
							console.error("Orgteamstatus[0] not updated to true");
							console.log(error.message);
							console.log("Error code: " + error.code);
						});
				}
			})
			.catch(error => {
				console.error("Organization not pushed to user or organization not pushed to orgslist")
				console.log(error.message);
				console.log("Error code: " + error.code);
			});

		//Clear values of input fields
		document.getElementById('school').value = "";
		document.getElementById('location').value = "";
		document.getElementById('levelHS').checked = false;
		document.getElementById('levelCO').checked = false;
	}
	else {
		pagestatus = true;
	}
}

function myOrg() {
	//Make true or true+ the value of orgstatus
	myorgref.once("value", function(myorgs) {
		let myorgannum = 0;
		for (const key in myorgs.val()) {
			myorgannum += 1;
		}

		if (myorgannum === 1) {
			database.ref('/orgteamstatus/' + currentUser.uid + '/0/')
				.set(true)
				.then(() => {
					console.log("Orgteamstatus[0] updated to true");
					localStorage.removeItem("orgstatus");
					window.location.href="../HTML/my_organizations.html";
				})
				.catch(error => {
					console.error("Orgteamstatus[0] not updated to true");
					console.log(error.message);
				 	console.log("Error code: " + error.code);
				});
		}
		else if (myorgannum > 1) {
			database.ref('/orgteamstatus/' + currentUser.uid + '/0/')
				.set("true+")
				.then(() => {
					console.log("Orgteamstatus[0] updated to true+");
					localStorage.removeItem("orgstatus");
					window.location.href="../HTML/my_organizations.html";
				})
				.catch(error => {
					console.error("Orgteamstatus[0] not updated to true+");
					console.log(error.message);
					console.log("Error code: " + error.code);
				});
		}
	}, function (error) {
		 	console.error("User's organizations not pulled from database");
		 	console.log(error.message);
		 	console.log("Error code: " + error.code);
	});
}