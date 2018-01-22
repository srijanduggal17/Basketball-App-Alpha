var currentUser;

var canedit = false;
var isediting = false;
var candelete = false;

var allowedtext = /^[a-zA-Z ']+$/;
var pagestatus = true;

var myorgref;

var editdiv = document.getElementById("editdiv");
var schoolinput = document.getElementById("school");
var locationinput = document.getElementById("location");
var levelHS = document.getElementById("levelHS");
var levelCO = document.getElementById("levelCO");
var addorgbutton = document.getElementById("addorgbutton");
var donebutton = document.getElementById("donebutton");

donebutton.addEventListener("click", done);
document.getElementById("joinorgbutton").addEventListener("click", joinOrg);
document.getElementById("createorg").addEventListener("click", createOrganization);
document.getElementById("joinorg").addEventListener("click", joinOrganization);
document.getElementById("addorgbutton").addEventListener("click", addOrg);
document.getElementById("checkbutton").addEventListener("click", saveChanges);
document.getElementById("deletebutton").addEventListener("click", deleteOrgs);
document.getElementById("editbutton").addEventListener("click", editOrgs);


//Checks if user is signed in
firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		//User is signed in
		currentUser = user;
		console.log("user signed in");
		console.log(user.uid);
		
		myorgref = database.ref('/users/' + currentUser.uid + '/organizations/');
		myorgref.once("value", function(myorgs) {
			for (const org in myorgs.val()) {
				let newdiv = document.createElement('div');
				newdiv.setAttribute('class', 'orgdiv');
				newdiv.addEventListener("click", orgPage);
				let newtext = document.createElement('p');

				console.log(org);

				database.ref('/organizationslist/' + myorgs.val()[org])
					.once("value", function(orgobj) {
						console.log(orgobj.val());
						newtext.innerHTML = orgobj.val()["name"];
						newdiv.setAttribute('data-name', orgobj.val()["name"]);
						newdiv.setAttribute('data-level', orgobj.val()["level"]);
						newdiv.setAttribute('data-location', orgobj.val()["location"]);
					}, function (error) {
						console.error("Organizations list not pulled from database");
						console.log(error.message);
						console.log("Error code: " + error.code);
					});
				newdiv.setAttribute('id', myorgs.val()[org]);
				newdiv.appendChild(newtext);
				document.getElementById("orgsdiv").appendChild(newdiv);
			}
		}, function (error) {
			console.error("User's organizations not pulled from database");
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

function orgPage() {
	console.log("org clicked");

	if (!canedit && isediting) {
		isediting = false;
	}

	else if (!canedit && !isediting && !candelete) {
		console.log("going to org's page")
		localStorage.setItem("currentorganization",this.id);
		window.location.href = "../HTML/my_teams.html";		
	}

	else if (canedit && !isediting) {
		this.appendChild(editdiv);
		editdiv.style.display = "block";
		schoolinput.value = this.dataset.name;
		locationinput.value = this.dataset.location;
		if (this.dataset.level === "CO") {
			levelCO.checked = true;
		}
		else if (this.dataset.level === "HS") {
			levelHS.checked = true;
		}
		isediting = true;
	}

	else if (candelete) {
		let selectedorg = this;
		let orgtoremove = database.ref('/organizationslist/' + selectedorg.id);
		let userstorem = [];

		orgtoremove.once("value", function(orgtorem) {
			for (let i = 0; i < orgtorem.val()["numofmembers"]; i++) {
				userstorem.push(orgtorem.val()["members"][i]);
			}

			if (orgtorem.val()["owner"] === currentUser.uid) {
				selectedorg.style.background = "blue";
				setTimeout(function(){
					let response;
					response = confirm("Are you sure you want to delete this organization?");

					if (response) {
						selectedorg.remove();
						let orgteams = [];
						orgtoremove.once("value", function(org) {
							for (const team in org.val()["teams"]){
								orgteams.push(org.val()["teams"][team]);
							}

							for (let i = 0; i < orgteams.length; i++) {
								database.ref('/teamslist/' + orgteams[i])
									.remove()
									.then(() => {
										console.log("Team removed from teamslist");
									})
									.catch(error => {
										console.error("Tesm not removed from teamslist");
										console.log(error.message);
										console.log("Error code: " + error.code);
									});
							}
			
							orgtoremove
								.remove()
								.then(() => {
									console.log("Organization removed from organizationslist")
								})
								.catch(error => {
									console.error("Organization not removed from organizationslist");
									console.log(error.message);
									console.log("Error code: " + error.code);
								});

							removeOrgFromUsers(userstorem);

						}, function (error) {
							console.error("Data for organization to remove not pulled from database");
							console.log(error.message);
							console.log("Error code: " + error.code);
						});
					}
					else if (!response) {
						selectedorg.style.background = "none";
					}
				},75);								
			}
			else {
				alert('You do not have permission to delete this organization');
			}
		}, function (error) {
			console.error("Data for organization to remove not pulled from database");
			console.log(error.message);
			console.log("Error code: " + error.code);
		});
	}
}

function removeOrgFromUsers(userstoremove) {
	for (let i = 0; i < userstoremove.length; i++) {
		database.ref('/users/' + userstoremove[i] + '/organizations/').once("value", function(orgslist) {
			let myorgannum = 0;
			for (const org in orgslist.val()) {
				myorgannum += 1;
			}

			for (const organ in orgslist.val()) {
				if (orgslist.val()[organ] === selectedorg.id) {
					database.ref('/users/' + userstoremove[i] + '/organizations/' + organ)
						.remove()
						.then(() => {
							console.log("Organization removed from user's list");
						})
						.catch(error => {
							console.error("Organization not removed from user's list");
							console.log(error.message);
							console.log("Error code: " + error.code);
						});
				}
			}

			if (myorgannum === 1) {
				if (currentUser.uid === userstoremove[i]) {
					console.log("No organizations");
					document.getElementById("messagediv").style.display = "block";
					document.getElementById("actiondiv").style.display = "none";											
				}
				database.ref('/orgteamstatus/' + userstoremove[i])
					.set([false, false])
					.then(() => {
						console.log('orgteamstatus changed to: [false, false]');
					})
					.catch(error => {
						console.error('orgteamstatus not changed to: [false, false]');
						console.log(error.message);
						console.log("Error code: " + error.code);
					});
			}
			else if (myorgannum === 2) {
				database.ref('/orgteamstatus/' + userstoremove[i] + '/0/')
					.set(true)
					.then(() => {
						console.log("Orgteamstatus[0] updated to true");
					})
					.catch(error => {
						console.error("Orgteamstatus[0] not updated to true");
						console.log(error.message);
					 	console.log("Error code: " + error.code);
					});
			}
			else if (myorgannum > 2) {
				database.ref('/orgteamstatus/' + userstoremove[i] + '/0/')
					.set("true+")
					.then(() => {
						console.log("Orgteamstatus[0] updated to true+");
					})
					.catch(error => {
						console.error("Orgteamstatus[0] not updated to true+");
						console.log(error.message);
						console.log("Error code: " + error.code);
					});
			}
		}, function (error) {
			console.error("Organizations not pulled for this user");
			console.log(error.message);
			console.log("Error code: " + error.code);
		});
	}
}

function editOrgs() {
	canedit = true;
	donebutton.style.display = "inline-block";
	editbutton.style.display = "none";
	deletebutton.style.display = "none";
	addorgbutton.style.display = "none";
}

function verifySaveChanges() {
	if (schoolinput.value === "" || schoolinput.value.match(allowedtext) === null) {
		document.getElementById("schoolaster").style.display = "inline";
		pagestatus = false;
	}
	else {
		document.getElementById("schoolaster").style.display = "none";
	}
	if (locationinput.value === "" || locationinput.value.match(allowedtext) === null) {
		document.getElementById("locationaster").style.display = "inline";
		pagestatus = false;
	}
	else {
		document.getElementById("locationaster").style.display = "none";
	}
}

function saveChanges() {
	canedit = false;

	let orgtoedit = this.parentNode.parentNode;

	//Asterisks
	verifySaveChanges();

	if (pagestatus) {
		//Update database
		if (levelCO.checked) {
			database.ref('/organizationslist/' + orgtoedit.id + '/level/')
				.set("CO")
				.then(() => {
					console.log("Level pushed to CO");
					orgtoedit.setAttribute('data-level', "CO");
				})
				.catch(error => {
					console.error("Level not pushed to CO");
					console.log(error.message);
					console.log("Error code: " + error.code);
				});
		}
		else if (levelHS.checked) {
			database.ref('/organizationslist/' + orgtoedit.id + '/level/')
				.set("HS")
				.then(() => {
					console.log("Level pushed to HS");
					orgtoedit.setAttribute('data-level', "HS");
				})
				.catch(error => {
					console.error("Level not pushed to HS");
					console.log(error.message);
					console.log("Error code: " + error.code);
				});
		}

		database.ref('/organizationslist/' + orgtoedit.id)
			.update({
				"name" : capitalizeName(schoolinput.value),
				"location" : capitalizeName(locationinput.value)
			})
			.then(() => {
				console.log("Organization data updated");
			})
			.catch(error => {
				console.error("Organization data not updated");
				console.log(error.message);
				console.log("Error code: " + error.code);
			});

		//Update visual
		orgtoedit.childNodes[0].innerHTML = capitalizeName(schoolinput.value);

		//Update data attributes
		orgtoedit.setAttribute('data-name', capitalizeName(schoolinput.value));
		orgtoedit.setAttribute('data-location', capitalizeName(locationinput.value));

		//Clear and remove editdiv
		schoolinput.value = "";
		locationinput.value = "";
		levelCO.checked = false;
		levelHS.checked = false;
		editdiv.style.display = "none";
		document.body.appendChild(editdiv);		
	}
	else {
		pagestatus = true;
	}
}

function deleteOrgs() {
	candelete = true;
	donebutton.style.display = "inline-block";
	editbutton.style.display = "none";
	deletebutton.style.display = "none";
	addorgbutton.style.display = "none";
}

function done() {
	canedit = false;
	candelete = false;
	isediting = false;

	donebutton.style.display = "none";
	editbutton.style.display = "inline-block";
	deletebutton.style.display = "inline-block";
	addorgbutton.style.display = "inline-block";

	schoolinput.value = "";
	locationinput.value = "";
	levelCO.checked = false;
	levelHS.checked = false;
	editdiv.style.display = "none";
	document.body.appendChild(editdiv);
}

function createOrganization() {
	//Push creating as value of orgstatus
	database.ref('/orgteamstatus/' + currentUser.uid + '/0/')
		.set("creating")
		.then(() => {
			console.log("orgteamstatus[0] set to creating");
			window.location.href = "../HTML/create_organization.html";
		})
		.catch(error => {
			console.error("orgteamstatus[0] not set to creating");
			console.log(error.message);
			console.log("Error code: " + error.code);
		});
}

function joinOrganization() {
	//Push joining as value of orgstatus
	database.ref('/orgteamstatus/' + currentUser.uid + '/0/')
		.set("joining")
		.then(() => {
			console.log("orgteamstatus[0] set to joining");
			window.location.href="../HTML/join_organization.html";
		})
		.catch(error => {
			console.error("orgteamstatus[0] not set to joining");
			console.log(error.message);
			console.log("Error code: " + error.code);
		});
}

function addOrg() {
	//Push creating as value of orgstatus
	database.ref('/orgteamstatus/' + currentUser.uid + '/0/')
		.set("true+creating")
		.then(() => {
			console.log("orgteamstatus[0] set to true+creating");
			localStorage.setItem("orgstatus", "+");
			window.location.href = "../HTML/create_organization.html";			
		})
		.catch(error => {
			console.error("orgteamstatus[0] not set to true+creating");
			console.log(error.message);
			console.log("Error code: " + error.code);
		});
}

function joinOrg() {
	//Push joining as value of orgstatus
	database.ref('/orgteamstatus/' + currentUser.uid + '/0/')
		.set("true+joining")
		.then(() => {
			console.log("orgteamstatus[0] set to true+joining");
			localStorage.setItem("orgstatus", "+");
			window.location.href = "../HTML/join_organization.html";
		})
		.catch(error => {
			console.error("orgteamstatus[0] not set to true+joining");
			console.log(error.message);
			console.log("Error code: " + error.code);
		});
}