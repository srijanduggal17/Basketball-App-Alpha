document.getElementById("signout").addEventListener("click", signOut);
document.getElementById("createorgbutton").addEventListener("click", createOrganization);
document.getElementById("myorganizations").addEventListener("click", myOrganizations);
document.getElementById("cancelbutton").addEventListener("click", cancel);

var currentUser;
var orgstable = document.getElementById("orgstable");
var myorgref;

firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		//User is signed in
		currentUser = user;
		console.log("user signed in");
		console.log(user.uid);

		database.ref('/organizationslist/')
			.once("value", function(organizationslist) {
				if (organizationslist.val() === null) {
					orgstable.style.display = "none";
					document.getElementById("messagediv").style.display = "block";
				}
				else {
					let orgarray = [];
					for (const org in organizationslist.val()) {
						if (organizationslist.val()[org]["complete"]) {
							orgarray.push(org);
						}
					}
					if (orgarray.length !== 0) {
						myorgref = database.ref('/users/' + currentUser.uid + '/organizations/');
						myorgref.once("value", function(myorgs) {
							for (const mine in myorgs.val()) {
								if (orgarray.includes(myorgs.val()[mine])){
									orgarray.splice(orgarray.indexOf(myorgs.val()[mine]),1);
								}
							}
							for (let i = 0; i < orgarray.length; i++) {
								let orgrow = document.createElement('tr');
								let orgname = document.createElement('td');
								let orglocation = document.createElement('td');
								orgname.innerHTML = organizationslist.val()[orgarray[i]]["name"];
								orglocation.innerHTML = organizationslist.val()[orgarray[i]]["location"];
								orgrow.appendChild(orgname);
								orgrow.appendChild(orglocation);
								orgrow.setAttribute("id", orgarray[i]);
								orgrow.addEventListener("click", joinOrg);
								orgstable.appendChild(orgrow);
							}

							if (orgarray.length === 0) {
								orgstable.style.display = "none";
								document.getElementById("messagediv").style.display = "block";
								if (localStorage.orgstatus === "+") {
									document.getElementById("myorganizations").style.display = "block";
								}
							}
						}, function(error) {
							console.error("User's organizations not pulled from database");
							console.log(error.message);
							console.log("Error code: " + error.code);
						});
					}
					else {
						orgstable.style.display = "none";
						document.getElementById("messagediv").style.display = "block";
						if (localStorage.orgstatus === "+") {
							document.getElementById("myorganizations").style.display = "block";
						}
					}
				}
			}, function(error) {
				console.error("Organizations list not pulled from database");
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

if (localStorage.orgstatus === "+") {
	document.getElementById("myorganizations").style.display = "block";
}
else {
	document.getElementById("cancelbutton").style.display = "block";
}

function joinOrg() {
	let joinorg = this.id;
	let promarray = [];

	database.ref('/organizationslist/' + joinorg).once("value", function(orgtojoin) {
		promarray.push(
			database.ref('/organizationslist/' + joinorg + '/members/' + orgtojoin.val()["numofmembers"])
				.set(currentUser.uid)
				.then(() => {
					console.log("User pushed to org");
				})
		);
		promarray.push(
			database.ref('/organizationslist/' + joinorg + '/numofmembers/')
				.transaction(val => {
					return val + 1;
				})
				.then(() => {
					console.log("Num of members updated");
				})			
		);
	}, function (error) {
		console.error("User's organizations not pulled from database");
		console.log(error.message);
		console.log("Error code: " + error.code);
	});

	promarray.push(
		database.ref('/users/' + currentUser.uid + '/organizations/')
			.push(joinorg)
			.then(() => {
				console.log("Organization pushed to user's list");
			})
	);

	Promise.all(promarray)
		.then(() => {
			if (localStorage.orgstatus === "+") {
				database.ref('/orgteamstatus/' + currentUser.uid)
					.set({
						0: "true+",
						1: true
					})
					.then(() => {
						console.log("Orgteamstatus updated to: " + ["true+", true]);
						localStorage.removeItem("orgstatus");
						window.location.href = "../HTML/my_organizations.html";
					})
					.catch(error => {
						console.error("Orgteamstatus not updated to: " + ["true+", true]);
						console.log(error.message);
						console.log("Error code: " + error.code);
					});
			}
			else {
				database.ref('/orgteamstatus/' + currentUser.uid)
					.set({
						0: true,
						1: true
					})
					.then(() => {
						console.log("Orgteamstatus updated to: " + [true, true]);
						window.location.href = "../HTML/my_organizations.html";
					})
					.catch(error => {
						console.error("Orgteamstatus not updated to: " + [true, true]);
						console.log(error.message);
					 	console.log("Error code: " + error.code);
					});
			}	
		})
		.catch(error => {
			console.error("User not pushed to org / num of members not updated / org not pushed to user's list");
			console.log(error.message);
		 	console.log("Error code: " + error.code);
		});



}

function createOrganization() {
	if (localStorage.orgstatus === "+") {
		database.ref('/orgteamstatus/' + currentUser.uid + '/0/')
			.set("true+creating")
				.then(() => {
					console.log("Orgteamstatus[0] updated to true+creating");
					window.location.href="../HTML/create_organization.html";
				})
				.catch(error => {
					console.error("Orgteamstatus[0] not updated to creating");
					console.log(error.message);
				 	console.log("Error code: " + error.code);
				});		
	}
	else {
		database.ref('/orgteamstatus/' + currentUser.uid + '/0/')
			.set("creating")
				.then(() => {
					console.log("Orgteamstatus[0] updated to creating");
					window.location.href="../HTML/create_organization.html";
				})
				.catch(error => {
					console.error("Orgteamstatus[0] not updated to creating");
					console.log(error.message);
				 	console.log("Error code: " + error.code);
				});
	}
}

function myOrganizations() {
	//Make true or true+ the value of orgstatus
	myorgref.once("value", function(myorgs) {
		let myorgannum = 0;
		for (const key in myorgs.val()) {
			myorgannum += 1;
		}

		console.log(myorgannum);

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

function cancel() {
	database.ref('/orgteamstatus/' + currentUser.uid + '/0/')
		.set(false)
		.then(() => {
			console.log("Orgteamstatus[0] updated to false");
			localStorage.removeItem("orgstatus");
			window.location.href="../HTML/create_join_organization.html";
		})
		.catch(error => {
			console.error("Orgteamstatus[0] not updated to false");
			console.log(error.message);
		 	console.log("Error code: " + error.code);
		});
}