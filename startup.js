firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		// User is signed in.
		console.log("user signed in");
		console.log(user.uid);

		//Pull orgstatus value for current user
		database.ref('/orgteamstatus/' + user.uid)
			.once("value", function(orgteamstatus) {
				console.log("orgteamstatus: ", orgteamstatus.val());
				switch (orgteamstatus.val().join(" ")) {
					//No organizations
					case "false false":
						console.log([false,false]);
						window.location.href = "HTML/create_join_organization.html";
						break;
					//Chosen to create an organization
					case "creating false":
						console.log(["creating", false]);
						window.location.href = "HTML/create_organization.html";
						break;
					//Created an organization, no teams/chose to create team
					case "true false":
						console.log([true, false]);
						window.location.href = "HTML/create_team.html";
						break;
					//Created an organization, team with no schedule
					case "true creating":
						console.log([true, "creating"]);
						window.location.href = "HTML/scheduleinput.html";
						break;
					//Created an organization with 1 team
						//Later this should be the home page for that team
					case "true true":
						console.log([true, true]);
						window.location.href = "HTML/my_organizations.html";
						break;
					//Created an organization with a team, chosen to make another organization
					case "true+creating true":
						console.log(["true+creating", true]);
						window.location.href = "HTML/create_organization.html";
						break;
					//Multiple organizations, one does not have a team
					case "true+ false":
						console.log(["true+", false]);
						window.location.href = "HTML/create_team.html";
						break;
					//Multiple organizations, one team with no schedule
					case "true+ creating":
						console.log(["true+", "creating"]);
						window.location.href = "HTML/scheduleinput.html";
						break;
					//Multiple organizations, each with complete teams
					case "true+ true":
						console.log(["true+", true]);
						window.location.href = "HTML/my_organizations.html";
						break;
					//Chosen to join an organization
					case "joining false":
						console.log(["joining", false]);
						window.location.href = "HTML/join_organization.html";
						break;
					//Created an organization, chosen to join another
					case "true+joining true":
						console.log(["true+joining", true]);
						window.location.href = "HTML/join_organization.html";
						break;
				}
			}, function (error) {
				console.error("Orgteamstatus not pulled from database");
				console.log(error.message);
				console.log("Error code: " + error.code);
			});
	}
	
	else {
		// No user is signed in.
		console.log("user is not signed in");
		window.location.href="HTML/sign_in_up.html";
	}
});