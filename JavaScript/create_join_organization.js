//Link buttons to functions
document.getElementById("createorg").addEventListener("click", createOrganization);
document.getElementById("joinorg").addEventListener("click", joinOrganization);
document.getElementById("signout").addEventListener("click", signOut);

var currentUser;

firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		//User is signed in
		currentUser = user;
		console.log("user signed in");
		console.log(currentUser.uid);  
	}
	else {
		//No user is signed in
		console.log("user is not signed in");
		window.location.href = "../HTML/sign_in_up.html";
	}
});

function createOrganization() {
	//Push creating as value of orgstatus
	database.ref('/orgteamstatus/' + currentUser.uid + '/0/')
		.set("creating")
		.then(() => {
			console.log('Orgteamstatus updated to creating');
			window.location.href="../HTML/create_organization.html";
		})
		.catch(error => {
			console.error('Orgteamstatus not updated to creating');
			console.log(error.message);
			console.log("Error code: " + error.code);
		});
}

function joinOrganization() {
	//Push creating as value of orgstatus
	database.ref('/orgteamstatus/' + currentUser.uid + '/0/')
		.set("joining")
		.then(() => {
			console.log('Orgteamstatus updated to joining');
			window.location.href="../HTML/join_organization.html";
		})
		.catch(error => {
			console.error('Orgteamstatus not updated to joining');
			console.log(error.message);
			console.log("Error code: " + error.code);
		});
}