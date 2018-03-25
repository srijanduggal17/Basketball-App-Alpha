var currentUser;

document.getElementById("editgeninfo").addEventListener("click", editGenInfo);
document.getElementById('createstaff').addEventListener("click", createStaff);
document.getElementById("editstaff").addEventListener("click", editStaffSection);
document.getElementById("editplayers").addEventListener("click", editPlayerSection);
document.getElementById("myorgnav").addEventListener("click", toMyOrg);
document.getElementById("myteamsnav").addEventListener("click", toMyTeam);
document.getElementById("homenav").addEventListener("click", navChange);
document.getElementById("schedulenav").addEventListener("click", navChange);
document.getElementById("datainputnav").addEventListener("click", navChange);
document.getElementById("individualsummariesnav").addEventListener("click", navChange);
document.getElementById("teamsummarynav").addEventListener("click", navChange);
document.getElementById("teaminfonav").addEventListener("click", navChange);
document.getElementById("accountinfonav").addEventListener("click", navChange);

var teamnameedit = document.getElementById("editteamname");
var headcoachedit = document.getElementById("editheadcoach");
var teamname = document.getElementById("teamname");
var headcoach = document.getElementById("headcoach");

//Relevant variables for editing staff members
var staffeditrow;
var staffeditname;
var editstaffnamediv = document.getElementById('editstaffnamediv');
var editstaffname = document.getElementById('editstaffname');
var editroledropdown = document.getElementById('editroledropdown');
var editroleaster = document.getElementById('editroleaster');
var staffeditaster = document.getElementById('staffeditaster');

//Relevant variables for editing players
var playereditrow;
var playereditname;
var playereditposition;
var playereditnumber;
var playereditheight;
var editplayernamediv = document.getElementById('editplayernamediv');
var editplayername = document.getElementById('editplayername');
var editplayerpositiondiv = document.getElementById('editplayerpositiondiv');
var editplayerposition = document.getElementById('editplayerposition');
var editplayerheightdiv = document.getElementById('editplayerheightdiv');
var editplayerheightfeet = document.getElementById('editplayerheightfeet');
var editplayerheightinches = document.getElementById('editplayerheightinches');
var editplayernumberdiv = document.getElementById('editplayernumberdiv');
var editplayernumber = document.getElementById('editplayernumber');
var playereditaster = document.getElementById('playereditaster');
var inteditedheight;
var inteditednumber;

//State variables
var genstatus = true;
var staffstatus = true;
var playerstatus = true;
var editstaffstatus = true;
var editplayerstatus = true;
var iseditinggen = false;
var iseditingstaff = false;
var iseditingplayers = false;

//Table references
var stafftable = document.getElementById("stafftable");
var playertable = document.getElementById("playertable");

//Allowed characters for text inputs
var allowedteamname = /^[a-zA-Z0-9 ']+$/;
var allowedname = /^[a-zA-Z ']+$/;
var allowedposition = /^[a-zA-Z ]+$/;

var teamref = database.ref('/teamslist/' + localStorage.currentteam);

//Temporary storage arrays
var staff = [];
var player = [];

//Checks if user is signed in
firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		//User is signed in
		currentUser = user;
		console.log("user signed in");
		console.log(user.uid);

		teamref.once("value", function(teamdata) {
			console.log(teamdata.val());
			teamname.innerHTML = teamdata.val().teamname;
			headcoach.innerHTML = teamdata.val().headcoach;

			for (const member in teamdata.val()["staff"]) {
				staff.push([teamdata.val()["staff"][member]["Name"], teamdata.val()["staff"][member]["Role"], member]);
				createStaffRow(teamdata, member);
			}

			for (const play in teamdata.val()["players"]) {
				player.push([teamdata.val()["players"][play]["Name"], teamdata.val()["players"][play]["Position"], teamdata.val()["players"][play]["Height"], teamdata.val()["players"][play]["Jersey Number"], play]);
				createPlayerRow(teamdata, play);
			}

			document.getElementById('staffinputrow').style.display = "none";
			document.getElementById('playerinputrow').style.display = "none";

			if (staff.length === 0) {
				//No staff
				//message and display input row
			}

			if (player.length === 0) {
				//no players
				//message and display input row
			}
		}, function (error) {
			console.error("Team data not pulled from database");
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

function createStaffRow(teamdatasrc, staffmember) {
	//Create a row and tabledata elements
	let newrow = stafftable.insertRow(stafftable.rows.length - 1);
	newrow.id = staffmember;
	let newnamesection = newrow.insertCell();
	let newrolesection = newrow.insertCell();
	let neweditcell = newrow.insertCell();
	let newdeletecell = newrow.insertCell();

	//Create text for table cells
	let newname = document.createElement('p');
	newname.innerHTML = teamdatasrc.val()["staff"][staffmember].Name;
	let newrole = document.createElement('p');
	newrole.innerHTML = teamdatasrc.val()["staff"][staffmember].Role;

	newnamesection.appendChild(newname);
	newrolesection.appendChild(newrole);

	//Make the edit and delete buttons
	let neweditbutton = document.createElement('button');
	neweditbutton.addEventListener("click", editStaff);
	neweditbutton.innerHTML = "Edit";
	neweditbutton.style.display = "none";
	neweditcell.appendChild(neweditbutton);
	let newdeletebutton = document.createElement('button');
	newdeletebutton.addEventListener("click", deleteStaff);
	newdeletebutton.innerHTML = "Delete";
	newdeletebutton.style.display = "none";
	newdeletecell.appendChild(newdeletebutton);
}

function createPlayerRow(teamdatasrc, playermember) {
	//Create a row and tabledata elements
	let newrow = playertable.insertRow(playertable.rows.length - 1);
	newrow.id = playermember;

	let newnamesection = newrow.insertCell();
	let newpositionsection = newrow.insertCell();
	let newheightsection = newrow.insertCell();
	let newnumbersection = newrow.insertCell();
	let neweditcell = newrow.insertCell();
	let newdeletecell = newrow.insertCell();

	//Create text for table cells
	let newname = document.createElement('p');
	newname.innerHTML = teamdatasrc.val()["players"][playermember]["Name"];
	newnamesection.appendChild(newname);
	let newposition = document.createElement('p');
	newposition.innerHTML = teamdatasrc.val()["players"][playermember]["Position"];
	newpositionsection.appendChild(newposition);
	let newheight = document.createElement('p');
	newheight.innerHTML = teamdatasrc.val()["players"][playermember]["Height"][0] + "' " + teamdatasrc.val()["players"][playermember]["Height"][1] + '"';
	newheightsection.appendChild(newheight);
	let newnumber = document.createElement('p');
	newnumber.innerHTML = teamdatasrc.val()["players"][playermember]["Jersey Number"];
	newnumbersection.appendChild(newnumber);

	//Make the edit and delete buttons
	let neweditbutton = document.createElement('button');
	neweditbutton.addEventListener("click", editPlayer);
	neweditbutton.innerHTML = "Edit";
	neweditbutton.style.display = "none";
	neweditcell.appendChild(neweditbutton);
	let newdeletebutton = document.createElement('button');
	newdeletebutton.addEventListener("click", deletePlayer);
	newdeletebutton.innerHTML = "Delete";
	newdeletebutton.style.display = "none";
	newdeletecell.appendChild(newdeletebutton);
}

function editGenInfo() {
	teamname.style.display = "none";
	headcoach.style.display = "none";
	teamnameedit.style.display = "table-cell";
	headcoachedit.style.display = "table-cell";
	teamnameedit.value = teamname.innerHTML;
	headcoachedit.value = headcoach.innerHTML;
	this.innerHTML = "Check";
	this.removeEventListener("click", editGenInfo);
	this.addEventListener("click", saveGenInfo);
	iseditinggen = true;
}

function verifyGenInfo(tmname, hdcoach) {
	if (tmname === "" || tmname.match(allowedteamname) === null) {
		document.getElementById('teamnameaster').style.display = "inline";
		genstatus = false;
	}
	else {
		document.getElementById('teamnameaster').style.display = "none";
	}
	if (hdcoach === "" || hdcoach.match(allowedname) === null) {
		document.getElementById('headcoachaster').style.display = "inline";
		genstatus = false;
	}
	else {
		document.getElementById('headcoachaster').style.display = "none";
	}
}

function saveGenInfo() {
	let editedteamname = teamnameedit.value;
	let editedheadcoach = headcoachedit.value;

	genstatus = true;

	verifyGenInfo(editedteamname, editedheadcoach);

	if (genstatus) {
		teamname.style.display = "block";
		headcoach.style.display = "block";
		teamnameedit.style.display = "none";
		headcoachedit.style.display = "none";
		teamname.innerHTML = capitalizeName(editedteamname);
		headcoach.innerHTML = capitalizeName(editedheadcoach);
		this.innerHTML = "Edit";
		this.removeEventListener("click", saveGenInfo);
		this.addEventListener("click", editGenInfo);

		let updates = {};
		updates['teamname'] = capitalizeName(teamnameedit.value);
		updates['headcoach'] = capitalizeName(headcoachedit.value);

		iseditinggen = false;

		teamref
			.update(updates)
			.then(() => {
				console.log("Headcoach and Teamname updated");
			})
			.catch(error => {
				console.error("Headcoach and Teamname not updated");
				console.log(error.message);
				console.log("Error code: " + error.code);
			});
	}
}

function editStaffSection() {
	document.getElementById('staffinputrow').style.display = "table-row";
	//Hide edit/delete buttons of other rows
	for (let i = 1; i < stafftable.rows.length - 1; i++) {
		$(stafftable.rows[i].cells[2]).children('button')[0].style.display = "table-cell";
		$(stafftable.rows[i].cells[3]).children('button')[0].style.display = "table-cell";
	}
	this.innerHTML = "Save";
	this.removeEventListener("click", editStaffSection);
	this.addEventListener("click", saveStaffSection);
}

function saveStaffSection() {
	if (!iseditingstaff) {
		staffeditaster.style.display = "none";
		let pushstaff = {};

		for (let i = 0; i < staff.length; i++) {
			pushstaff[staff[i][2]] = {
				Name: staff[i][0],
				Role: staff[i][1]
			};
		}

		teamref.child("staff")
			.set(pushstaff)
			.then(() => {
				console.log("Staff updated");
			})
			.catch(error => {
				console.error("Staff not updated");
				console.log(error.message);
				console.log("Error code: " + error.code);
			});

		document.getElementById('staffinputrow').style.display = "none";
		//Hide edit/delete buttons of other rows
		for (let i = 1; i < stafftable.rows.length - 1; i++) {
			$(stafftable.rows[i].cells[2]).children('button')[0].style.display = "none";
			$(stafftable.rows[i].cells[3]).children('button')[0].style.display = "none";
		}
		this.innerHTML = "Edit";
		this.addEventListener("click", editStaffSection);
		this.removeEventListener("click", saveStaffSection);		
	}
	else {
		staffeditaster.style.display = "inline";
	}
}

function editPlayerSection() {
	document.getElementById('playerinputrow').style.display = "table-row";
	//Hide edit/delete buttons of other rows
	for (let i = 1; i < playertable.rows.length - 1; i++) {
		$(playertable.rows[i].cells[4]).children('button')[0].style.display = "table-cell";
		$(playertable.rows[i].cells[5]).children('button')[0].style.display = "table-cell";
	}
	this.innerHTML = "Save";
	this.removeEventListener("click", editPlayerSection);
	this.addEventListener("click", savePlayerSection);
}

function savePlayerSection() {
	if (!iseditingplayers) {
		playereditaster.style.display = "none";
		let pushplayers = {};

		for (let i = 0; i < player.length; i++) {
			pushplayers[player[i][4]] = {
				Name: player[i][0],
				Position: player[i][1],
				Height: player[i][2],
				"Jersey Number": player[i][3]
			};
		}

		teamref.child("players")
			.set(pushplayers)
			.then(() => {
				console.log("Players updated");
			})
			.catch(error => {
				console.error("Players not updated");
				console.log(error.message);
				console.log("Error code: " + error.code);
			});


		document.getElementById('playerinputrow').style.display = "none";
		//Hide edit/delete buttons of other rows
		for (let i = 1; i < playertable.rows.length - 1; i++) {
			$(playertable.rows[i].cells[4]).children('button')[0].style.display = "none";
			$(playertable.rows[i].cells[5]).children('button')[0].style.display = "none";
		}
		this.innerHTML = "Edit";
		this.addEventListener("click", editPlayerSection);
		this.removeEventListener("click", savePlayerSection);
	}
	else {
		playereditaster.style.display = "inline";
	}
}

/////////////// This section is for the staff table ///////////////
//Adds a staff member to the table
function createStaff() {
	//Get user inputs
	let staffnamein = document.getElementById('staffname').value;
	let rolein = document.getElementById('roledropdown').value;

	//Show/hide red asterisk if input is invalid
	verifyCreateStaff(staffnamein, rolein);

	//This executes if input is valid
	if (staffstatus) {
		//Push staff data to array
		let pushkey = teamref.child("staff").push().key
		staff.push([capitalizeName(staffnamein), rolein, pushkey]);

		addStaffRow(pushkey, staffnamein, rolein);

		//Clear the input fields
		document.getElementById("staffname").value = "";
		document.getElementById('roledropdown').value = "";
	}
	else {
		staffstatus = true;
	}
}

function verifyCreateStaff(staffname, role) {
	if (staffname === "" || staffname.match(allowedname) === null) {
		document.getElementById('staffnameaster').style.display = "inline";
		staffstatus = false;
	}
	else {
		document.getElementById('staffnameaster').style.display = "none";
	}
	if (role === "") {
		document.getElementById('roleaster').style.display = "inline";
		staffstatus = false;
	}
	else {
		document.getElementById('roleaster').style.display = "none";
	}
}

function addStaffRow(key, name, role) {
	//Create a row and tabledata elements
	let newrow = stafftable.insertRow(stafftable.rows.length - 1);
	newrow.id = key;
	let newnamesection = newrow.insertCell();
	let newrolesection = newrow.insertCell();
	let neweditcell = newrow.insertCell();
	let newdeletecell = newrow.insertCell();

	//Create text for table cells
	let newname = document.createElement('p');
	newname.innerHTML = capitalizeName(name);
	let newrole = document.createElement('p');
	newrole.innerHTML = role;

	newnamesection.appendChild(newname);
	newrolesection.appendChild(newrole);

	//Make the edit and delete buttons
	let neweditbutton = document.createElement('button');
	neweditbutton.addEventListener("click", editStaff);
	neweditbutton.innerHTML = "Edit";
	neweditcell.appendChild(neweditbutton);
	let newdeletebutton = document.createElement('button');
	newdeletebutton.addEventListener("click", deleteStaff);
	newdeletebutton.innerHTML = "Delete";
	newdeletecell.appendChild(newdeletebutton);
}

//Allows user to edit staff members
function editStaff() {
	//Gets the row being edited.
	staffeditrow = this.parentNode.parentNode;

	//Replace name with input field
	staffeditname = staffeditrow.cells[0].childNodes[0].innerHTML;
	staffeditrow.cells[0].childNodes[0].style.display = "none";
	staffeditrow.cells[0].appendChild(editstaffnamediv);
	editstaffnamediv.style.display = "table-cell";
	editstaffname.value = staffeditname;

	//Replace role with dropdown
	staffeditrow.cells[1].childNodes[0].style.display = "none";
	staffeditrow.cells[1].appendChild(editroledropdown);
	editroledropdown.style.display = "table-cell";
	editroledropdown.value = staffeditrow.childNodes[1].childNodes[0].innerHTML;

	//Append asterisks
	staffeditrow.cells[1].appendChild(editroleaster);
	staffeditrow.cells[2].appendChild(staffeditaster);

	//Hide new staff input row
	document.getElementById('staffinputrow').style.display = "none";

	//Hide edit/delete buttons of other rows
	for (let i = 1; i < stafftable.rows.length - 1; i++) {
		$(stafftable.rows[i].cells[2]).children('button')[0].style.display = "none";
		$(stafftable.rows[i].cells[3]).children('button')[0].style.display = "none";
	}

	//Change function of edit button to save
	$(staffeditrow.cells[2]).children('button')[0].removeEventListener("click", editStaff);
	$(staffeditrow.cells[2]).children('button')[0].addEventListener("click", saveStaffChanges);
	$(staffeditrow.cells[2]).children('button')[0].innerHTML = "Check";

	//Unhide save/delete button of row being edited
	$(staffeditrow.cells[2]).children('button')[0].style.display = "table-cell";
	$(staffeditrow.cells[3]).children('button')[0].style.display = "table-cell";

	//Change editingstaff state variable
	iseditingstaff = true;
}

//Save edits to staff
function saveStaffChanges() {
	//Get user inputs
	let editednamein = capitalizeName(editstaffname.value);
	let editedrolein = editroledropdown.value;

	//Show/hide red asterisk if input is invalid
	verifySaveStaff(editednamein, editedrolein);

	//This executes if inputs are valid
	if (editstaffstatus) {
		staffeditaster.style.display = "none";
		//Change staff data in array
		for (let i = 0; i < staff.length; i++) {
			if (staff[i][2] === this.parentNode.parentNode.id) {
				staff[i][0] = editednamein;
				staff[i][1] = editedrolein;
				break;
			}
		}

		//Move the elements for editing to the general div and hide them
		document.getElementById('staffdiv').appendChild(editroledropdown);
		document.getElementById('staffdiv').appendChild(editroleaster);
		document.getElementById('staffdiv').appendChild(editstaffnamediv);
		document.getElementById('staffdiv').appendChild(editroleaster);
		document.getElementById('staffdiv').appendChild(staffeditaster);
		staffeditaster.style.display = "none";
		editroledropdown.style.display = "none";
		editstaffnamediv.style.display = "none";

		//Update text in table
		staffeditrow.cells[0].childNodes[0].innerHTML = editednamein;
		staffeditrow.cells[0].childNodes[0].style.display = "table-cell";
		staffeditrow.cells[1].childNodes[0].innerHTML = editedrolein;
		staffeditrow.cells[1].childNodes[0].style.display = "table-cell";

		//Show new staff input row
		document.getElementById('staffinputrow').style.display = "table-row";

		//Change save button to edit
		$(staffeditrow.cells[2]).children('button')[0].innerHTML = "Edit";
		$(staffeditrow.cells[2]).children('button')[0].removeEventListener("click", saveStaffChanges);
		$(staffeditrow.cells[2]).children('button')[0].addEventListener("click", editStaff);

		//Unhide edit/delete buttons of all rows
		for (let i = 1; i < stafftable.rows.length - 1; i++) {
			$(stafftable.rows[i].cells[2]).children('button')[0].style.display = "table-cell";
			$(stafftable.rows[i].cells[3]).children('button')[0].style.display = "table-cell";
		}

		//Change editingstaff state variable
		iseditingstaff = false;
	}
	else {
		editstaffstatus = true;
	}
}

function verifySaveStaff(editedname, editedrole) {
	if (editedname === "" || editedname.match(allowedname) === null) {
		document.getElementById('editstaffnameaster').style.display = "inline";
		editstaffstatus = false;
	}
	else {
		document.getElementById('editstaffnameaster').style.display = "none";
	}
	if (editedrole === "") {
		document.getElementById('editroleaster').style.display = "inline";
		editstaffstatus = false;
	}
	else {
		document.getElementById('editroleaster').style.display = "none";
	}
}

//Deletes a staff member
function deleteStaff() {
	//Move the elements for editing to the general div and hide them
	document.getElementById('staffinputrow').style.display = "table-row";
	document.getElementById('staffdiv').appendChild(editstaffnamediv);
	document.getElementById('staffdiv').appendChild(editroledropdown);
	document.getElementById('staffdiv').appendChild(editroleaster);
	document.getElementById('staffdiv').appendChild(staffeditaster);
	editstaffnamediv.style.display = "none";
	editroleaster.style.display = "none";
	staffeditaster.style.display = "none";
	editroledropdown.style.display = "none";

	//Gets the person to delete and removes them from the data array and table
	let stafftodelete = this.parentNode.parentNode.childNodes[0].childNodes[0].innerHTML;
	for (let i = 0; i < staff.length; i++) {
		if (staff[i][2] === this.parentNode.parentNode.id) {
			staff.splice(i,1);
			break;
		}
	}
	this.parentNode.parentNode.remove();

	//Unhide the edit/delete buttons for all rows
	for (let i = 1; i < stafftable.rows.length - 1; i++) {
		$(stafftable.rows[i].cells[2]).children('button')[0].style.display = "table-cell";
		$(stafftable.rows[i].cells[3]).children('button')[0].style.display = "table-cell";
	}

	//Change editingstaff state variable
	iseditingstaff = false;
	editstaffstatus = true;
}

//Adds a player to the table
function createPlayer() {
	//Get user inputs
	let playernamein = document.getElementById("playername").value;
	let playerpositionin = document.getElementById("playerposition").value;
	let playerheightin = [document.getElementById("playerheightfeet").value,document.getElementById("playerheightinches").value];
	let playernumberin = document.getElementById("playernumber").value;
	let intplayernumber = parseInt(playernumberin);
	let intplayerheight = [parseInt(playerheightin[0]), parseInt(playerheightin[1])];

	//Show/hide red asterisk if input is invalid
	verifyCreatePlayer(playernamein, playerpositionin, playernumberin, playerheightin);

	//This executes if input is valid
	if (playerstatus) {
		//Push staff data to array
		let pushkey = teamref.child("players").push().key
		player.push([capitalizeName(playernamein), capitalizeName(playerpositionin), playerheightin, playernumberin, pushkey]);

		addPlayerRow(pushkey, playernamein, playerpositionin, playerheightin, playernumberin);

		//Clear the input fields
		document.getElementById("playername").value="";
		document.getElementById("playerposition").value="";
		document.getElementById("playerheightfeet").value="";
		document.getElementById("playerheightinches").value="";
		document.getElementById("playernumber").value="";
	}
	else {
		playerstatus = true;
	}
}

function verifyCreatePlayer(playername, playerposition, playernumber, playerheight) {
	if (playername === "" || playername.match(allowedname) === null) {
		document.getElementById("playernameaster").style.display = "inline";
		playerstatus = false;
	}
	else {
		document.getElementById("playernameaster").style.display = "none";
	}
	if (playerposition === "" || playerposition.match(allowedposition) === null) {
		document.getElementById("playerpositionaster").style.display = "inline";
		playerstatus = false;
	}
	else {
		document.getElementById("playerpositionaster").style.display = "none";
	}
	if (playernumber === "" || playernumber.includes("-") || playernumber.includes(".") || playernumber.includes("+") || intplayernumber < 100 === false) {
		document.getElementById("playernumberaster").style.display = "inline";
		playerstatus = false;
	}
	else {
		document.getElementById("playernumberaster").style.display = "none";
	}
	if (playerheight[0] === "" || playerheight[0].includes("-") || playerheight[0].includes(".") || playerheight[0].includes("+") || !(intplayerheight[0] < 9)) {
		document.getElementById("playerheightfeetaster").style.display = "inline";
		playerstatus = false;
	}
	else {
		document.getElementById("playerheightfeetaster").style.display = "none";
	}
	if (playerheight[1] === "" || playerheight[1].includes("-") || playerheight[1].includes(".") || playerheight[1].includes("+") || !(intplayerheight[1] < 13)) {
		document.getElementById("playerheightinchesaster").style.display = "inline";
		playerstatus = false;
	}
	else {
		document.getElementById("playerheightinchesaster").style.display = "none";
	}
}

function addPlayerRow(key, name, pos, height, num) {
	//Create a row and tabledata elements
	let newrow = playertable.insertRow(playertable.rows.length - 1);
	newrow.id = key;
	let newnamesection = newrow.insertCell();
	let newpositionsection = newrow.insertCell();
	let newheightsection = newrow.insertCell();
	let newnumbersection = newrow.insertCell();
	let neweditcell = newrow.insertCell();
	let newdeletecell = newrow.insertCell();

	//Create text for table cells
	let newname = document.createElement('p');
	newname.innerHTML = capitalizeName(name);
	newnamesection.appendChild(newname);
	let newposition = document.createElement('p');
	newposition.innerHTML = capitalizeName(pos);
	newpositionsection.appendChild(newposition);
	let newheight = document.createElement('p');
	newheight.innerHTML = height[0] + "' " + height[1] + '"';
	newheightsection.appendChild(newheight);
	let newnumber = document.createElement('p');
	newnumber.innerHTML = num;
	newnumbersection.appendChild(newnumber);

	//Make the edit and delete buttons
	let neweditbutton = document.createElement('button');
	neweditbutton.addEventListener("click", editPlayer);
	neweditbutton.innerHTML = "Edit";
	neweditcell.appendChild(neweditbutton);
	let newdeletebutton = document.createElement('button');
	newdeletebutton.addEventListener("click", deletePlayer);
	newdeletebutton.innerHTML = "Delete";
	newdeletecell.appendChild(newdeletebutton);
}

//Allows user to edit players
function editPlayer() {
	//Gets the row being edited
	playereditrow = this.parentNode.parentNode;

	//Replace name with input field
	playereditname = playereditrow.cells[0].childNodes[0].innerHTML;
	playereditrow.cells[0].childNodes[0].style.display = "none";
	playereditrow.cells[0].appendChild(editplayernamediv);
	editplayernamediv.style.display = "table-cell";
	editplayername.value = playereditname;	

	//Replace position with input field
	playereditposition = playereditrow.cells[1].childNodes[0].innerHTML;
	playereditrow.cells[1].childNodes[0].style.display = "none";
	playereditrow.cells[1].appendChild(editplayerpositiondiv);
	editplayerpositiondiv.style.display = "table-cell";
	editplayerposition.value = playereditposition;

	//Replace height with number inputs
	playereditheight = playereditrow.cells[2].childNodes[0].innerHTML;
	playereditrow.cells[2].childNodes[0].style.display = "none";
	playereditrow.cells[2].appendChild(editplayerheightdiv);
	editplayerheightdiv.style.display = "table-cell";
	editplayerheightfeet.value = playereditheight.split("'")[0];
	editplayerheightinches.value = playereditheight.split("'")[1].slice(1,-1);

	//Replace number with number input
	playereditnumber = playereditrow.cells[3].childNodes[0].innerHTML;
	playereditrow.cells[3].childNodes[0].style.display = "none";
	playereditrow.cells[3].appendChild(editplayernumberdiv);
	editplayernumberdiv.style.display = "table-cell";
	editplayernumber.value = playereditnumber;

	//Hide new player input row
	document.getElementById('playerinputrow').style.display = "none";

	//Hide edit/delete buttons of other rows
	for (let i = 1; i < playertable.rows.length - 1; i++) {
		$(playertable.rows[i].cells[4]).children('button')[0].style.display = "none";
		$(playertable.rows[i].cells[5]).children('button')[0].style.display = "none";
	}

	//Append asterisk
	playereditrow.cells[4].appendChild(playereditaster);

	//Change function of edit button to save
	$(playereditrow.cells[4]).children('button')[0].removeEventListener("click", editPlayer);
	$(playereditrow.cells[4]).children('button')[0].addEventListener("click", savePlayer);
	$(playereditrow.cells[4]).children('button')[0].innerHTML = "Check";

	//Unhide save/delete button of row being edited
	$(playereditrow.cells[4]).children('button')[0].style.display = "table-cell";
	$(playereditrow.cells[5]).children('button')[0].style.display = "table-cell";

	//Change editingplayer state variable
	iseditingplayers = true;
}

//Save edits to player
function savePlayer() {
	//Get user inputs
	let editednamein = editplayername.value;
	let editedpositionin = editplayerposition.value;
	let editedheightin = [editplayerheightfeet.value, editplayerheightinches.value];
	let editednumberin = editplayernumber.value;
	inteditednumber = parseInt(editednumberin);
	inteditedheight = [parseInt(editedheightin[0]), parseInt(editedheightin[1])];

	//Show/hide red asterisk if input is invalid
	verifySavePlayer(editednamein, editedpositionin, editedheightin, editednumberin);

	//This executes if inputs are valid
	if (editplayerstatus) {
		playereditaster.style.display = "none";
		//Change player data in array
		for (let i = 0; i < player.length; i++) {
			if (player[i][4] === this.parentNode.parentNode.id) {
				player[i][0] = capitalizeName(editednamein);
				player[i][1] = capitalizeName(editedpositionin);
				player[i][2] = editedheightin;
				player[i][3] = editednumberin;
			}
		}

		//Move the elements for editing to the general div and hide them
		document.getElementById('playersdiv').appendChild(editplayernamediv);
		document.getElementById('playersdiv').appendChild(editplayerpositiondiv);
		document.getElementById('playersdiv').appendChild(editplayerheightdiv);
		document.getElementById('playersdiv').appendChild(editplayernumberdiv);
		document.getElementById('playersdiv').appendChild(playereditaster);
		playereditaster.style.display = "none";
		editplayernamediv.style.display = "none";
		editplayerpositiondiv.style.display = "none";
		editplayerheightdiv.style.display = "none";
		editplayernumberdiv.style.display = "none";

		//Update text in table
		playereditrow.cells[0].childNodes[0].innerHTML = capitalizeName(editednamein);
		playereditrow.cells[0].childNodes[0].style.display = "table-cell";
		playereditrow.cells[1].childNodes[0].innerHTML = capitalizeName(editedpositionin);
		playereditrow.cells[1].childNodes[0].style.display = "table-cell";
		playereditrow.cells[2].childNodes[0].innerHTML = editedheightin[0] + "' " + editedheightin[1] + '"';
		playereditrow.cells[2].childNodes[0].style.display = "table-cell";
		playereditrow.cells[3].childNodes[0].innerHTML = editednumberin;
		playereditrow.cells[3].childNodes[0].style.display = "table-cell";

		//Show new player input row
		document.getElementById('playerinputrow').style.display = "table-row";

		//Change save button to edit
		$(playereditrow.cells[4]).children('button')[0].innerHTML = "Edit";
		$(playereditrow.cells[4]).children('button')[0].removeEventListener("click", savePlayer);
		$(playereditrow.cells[4]).children('button')[0].addEventListener("click", editPlayer);

		//Unhide edit/delete buttons of all rows
		for (let i = 1; i < playertable.rows.length - 1; i++) {
			$(playertable.rows[i].cells[4]).children('button')[0].style.display = "table-cell";
			$(playertable.rows[i].cells[5]).children('button')[0].style.display = "table-cell";
		}

		//Change editingplayer state variable
		iseditingplayers = false;
	}
	else {
		editplayerstatus = true;
	}
}

function verifySavePlayer(editedname, editedposition, editedheight, editednumber) {
	if (editedname === "" || editedname.match(allowedname) === null) {
		document.getElementById('editplayernameaster').style.display = "inline";
		editplayerstatus = false;
	}
	else {
		document.getElementById('editplayernameaster').style.display = "none";
	}
	if (editedposition === "" || editedposition.match(allowedposition) === null) {
		document.getElementById('editplayerpositionaster').style.display = "inline";
		editplayerstatus = false;
	}
	else {
		document.getElementById('editplayerpositionaster').style.display = "none";
	}
	if (editedheight[0] === "" || editedheight[0].includes("-") || editedheight[0].includes(".") || editedheight[0].includes("+") || !(inteditedheight[0] < 9)) {
		document.getElementById('editplayerheightfeetaster').style.display = "inline";
		editplayerstatus = false;
	}
	else {
		document.getElementById('editplayerheightfeetaster').style.display = "none";
	}
	if (editedheight[1] === "" || editedheight[1].includes("-") || editedheight[1].includes(".") || editedheight[1].includes("+") || !(inteditedheight[1] < 13)) {
		document.getElementById('editplayerheightinchesaster').style.display = "inline";
		editplayerstatus = false;
	}
	else {
		document.getElementById('editplayerheightinchesaster').style.display = "none";
	}
	if (editednumber === "" || editednumber.includes("-") || editednumber.includes(".") || editednumber.includes("+") || !(inteditednumber < 100)) {
		document.getElementById('editplayernumberaster').style.display = "inline";
		editplayerstatus = false;
	}
	else {
		document.getElementById('editplayernumberaster').style.display = "none";
	}
}

//Deletes a player
function deletePlayer() {
	//Move the elements for editing to the general div and hide them
	document.getElementById('playerinputrow').style.display = "table-row";
	document.getElementById('playersdiv').appendChild(editplayernamediv);
	document.getElementById('playersdiv').appendChild(editplayerpositiondiv);
	document.getElementById('playersdiv').appendChild(editplayerheightdiv);
	document.getElementById('playersdiv').appendChild(editplayernumberdiv);
	document.getElementById('playersdiv').appendChild(playereditaster);
	editplayernamediv.style.display = "none";
	editplayerpositiondiv.style.display = "none";
	editplayerheightdiv.style.display = "none";
	editplayernumberdiv.style.display = "none";
	playereditaster.style.display = "none";

	//Gets the person to delete and removes them from the data array and table
	let playertodelete = this.parentNode.parentNode.childNodes[0].childNodes[0].innerHTML;
	for (let i = 0; i < player.length; i++) {
		if (player[i][4] === this.parentNode.parentNode.id) {
			player.splice(i,1);
		}
	}
	this.parentNode.parentNode.remove();

	//Unhide the edit/delete buttons for all rows
	for (let i = 1; i < playertable.rows.length - 1; i++) {
		$(playertable.rows[i].cells[4]).children('button')[0].style.display = "table-cell";
		$(playertable.rows[i].cells[5]).children('button')[0].style.display = "table-cell";
	}

	//Change editingplayer state variable
	iseditingplayers = false;
	editplayerstatus = true;
}

function toMyOrg() {
	if (!iseditinggen && !iseditingplayers && !iseditingstaff) {
		localStorage.removeItem("currentteam");
		localStorage.removeItem("currentorganization");
		window.location.href = "my_organizations.html";	
	}
}

function toMyTeam() {
	if (!iseditinggen && !iseditingplayers && !iseditingstaff) {
		localStorage.removeItem("currentteam");
		window.location.href = "my_teams.html";
	}	
}

function navChange() {
	if (!iseditinggen && !iseditingplayers && !iseditingstaff) {
		window.location.href = this.dataset.link;
	}
}