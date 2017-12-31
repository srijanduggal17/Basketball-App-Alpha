//Link buttons to functions
document.getElementById("signUp").addEventListener("click",signUp);
document.getElementById("signIn").addEventListener("click",signIn);

//Declare variables for inputs
var email;
var pass;
var fullname;

//Declare asterisk variables
var emailaster = document.getElementById("emailaster");
var passwordaster = document.getElementById("passwordaster");
var nameaster = document.getElementById("nameaster");

//Declare pagestatus variable
var pagestatus = true;

function signUp() {
	//Pull input data from fields
	email = document.getElementById('email').value;
	pass = document.getElementById('password').value;
	fullname = document.getElementById('name').value;

	if (email === "") {
		emailaster.style.display = "inline";
		pagestatus = false;
	}
	else {
		emailaster.style.display = "none";
	}

	if (pass === "") {
		passwordaster.style.display = "inline";
		pagestatus = false;
	}
	else {
		passwordaster.style.display = "none";
	}

	if (fullname === "") {
		nameaster.style.display = "inline";
		pagestatus = false;
	}
	else {
		nameaster.style.display = "none";
	}


	//Run the following if email, password, and name were typed in
	if(pagestatus) {
		firebase.auth().createUserWithEmailAndPassword(email, pass).then(function() {
			//This function runs if the user is successfully created
			console.log("Account Created");

			firebase.auth().onAuthStateChanged(function(user) {
				if (user) {
					//This executes once the user is authorized
					console.log("User signed in");

					let userinfo = {
						email: user.email,
						name: capitalizeName(fullname)
					};

					user.updateProfile({
						displayName: capitalizeName(fullname)
					}).then(function(update){
						// Update successful
						console.log("Name stored in profile");
					}).catch(function(error){
						// An error happened
						console.error("User profile not updated");
						console.log(error.message);
						console.log("Error code: " + error.code);
					});

					let updates = {};
					updates['/users/' + user.uid] = userinfo;
					updates['/orgteamstatus/' + user.uid] = [false,false];

					database.ref()
						.update(updates)
						.then(() => {
							console.log('User info and orgteamstatus set');
							window.location.href = "../HTML/create_join_organization.html";
						})
						.catch(function(error) {
							console.error('User info and orgteamstatus not set');
						});						

					//Clear text fields
					document.getElementById('email').value = "";
					document.getElementById('password').value = "";
					document.getElementById('name').value = "";
				}

				else {
					console.log("User not signed in");
				}
			});
		}, function(error) {
			console.error("User not created");
			console.log(error.message);
			console.log("Error code: " + error.code);
			alert(error.message);
		});
	}
	else {
		pagestatus = true;
	}
}

function signIn() {
	//Pull input data from fields
	email = document.getElementById('email').value;
	pass = document.getElementById('password').value;

	if (email === "") {
		emailaster.style.display = "inline";
		pagestatus = false;
	}
	else {
		emailaster.style.display = "none";
	}

	if (pass === "") {
		passwordaster.style.display = "inline";
		pagestatus = false;
	}
	else {
		passwordaster.style.display = "none";
	}

	//Run the following if email and password were typed in
	if(pagestatus) {
		firebase.auth().signInWithEmailAndPassword(email, pass).then(function() {
			//This function runs if the user is signed in
			
			firebase.auth().onAuthStateChanged(function(user) {
				if (user) {
					//This executes once the user is authorized
					console.log("User signed in");

					//Clear fields
					document.getElementById('email').value = "";
					document.getElementById('password').value = "";
					document.getElementById('name').value = "";

					//Pull orgstatus value for current user
					database.ref('/orgteamstatus/' + user.uid)
						.once("value", function(orgteamstatus) {
							console.log(orgteamstatus.val().join(" "));
							switch (orgteamstatus.val().join(" ")) {
								//No organizations
								case "false false":
									console.log([false,false]);
									window.location.href = "../HTML/create_join_organization.html";
									break;
								//Chosen to create an organization
								case "creating false":
									console.log(["creating", false]);
									window.location.href = "../HTML/create_organization.html";
									break;
								//Created an organization, no teams/chose to create team
								case "true false":
									console.log([true, false]);
									window.location.href = "../HTML/create_team.html";
									break;
								//Created an organization, team with no schedule
								case "true creating":
									console.log([true, "creating"]);
									window.location.href = "../HTML/scheduleinput.html";
									break;
								//Created an organization with 1 team
									//Later this should be the home page for that team
								case "true true":
									console.log([true, true]);
									window.location.href = "../HTML/my_organizations.html";
									break;
								//Created an organization with a team, chosen to make another organization
								case "true+creating true":
									console.log(["true+creating", true]);
									window.location.href = "../HTML/create_organization.html";
									break;
								//Multiple organizations, one does not have a team
								case "true+ false":
									console.log(["true+", false]);
									window.location.href = "../HTML/create_team.html";
									break;
								//Multiple organizations, one team with no schedule
								case "true+ creating":
									console.log(["true+", "creating"]);
									window.location.href = "../HTML/scheduleinput.html";
									break;
								//Multiple organizations, each with complete teams
								case "true+ true":
									console.log(["true+", true]);
									window.location.href = "../HTML/my_organizations.html";
									break;
								//Chosen to join an organization
								case "joining false":
									console.log(["joining", false]);
									window.location.href = "../HTML/join_organization.html";
									break;
								//Created an organization, chosen to join another
								case "true+joining true":
									console.log(["true+joining", true]);
									window.location.href = "../HTML/join_organization.html";
									break;
							}
						}, function(error) {
							console.error("Orgteamstatus not pulled");
							console.log(error.message);
							console.log("Error code: " + error.code);
						});
				}

				else {
					console.log("User not signed in");
				}
			});	
		}, function(error) {
			console.error("User not signed in");
			console.log(error.message);
			console.log("Error code: " + error.code);
			alert(error.message);
		});
	}
}