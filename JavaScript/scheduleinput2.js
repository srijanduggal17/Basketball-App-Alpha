document.getElementById("selectgame").addEventListener("click", selectEvent);
document.getElementById("selectpractice").addEventListener("click", selectEvent);
document.getElementById("editselectgame").addEventListener("click", editSelectEvent);
document.getElementById("editselectpractice").addEventListener("click", editSelectEvent);
document.getElementById("finishbutton").addEventListener("click", saveEvents);
document.getElementById("signOut").addEventListener("click", signOut);
document.getElementById("makeevent").addEventListener("click", makeEvent);
var currentUser;
var teamkey = localStorage.currentteam;
var savestatus = true;
var pagestatus = true;
var eventstatus = true;

//Checks if user is signed in
firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		//User is signed in
		currentUser = user;
		console.log("user signed in");
		console.log(user.uid);
	}
	else {
		//No user is signed in
		console.log("user is not signed in");
		window.location.href = "../HTML/sign_in_up.html";
	}
});

var eventname = null;

var schedule = [];

var eventtable = document.getElementById('eventtable');
var eventdiv = document.getElementById('eventdiv');
var editeventnamediv = document.getElementById('editeventnamediv');
var editeventdatediv = document.getElementById('editeventdatediv');
var editeventtimestartdiv = document.getElementById('editeventtimestartdiv');
var editeventtimeenddiv = document.getElementById('editeventtimeenddiv');
var editeventlocationdiv = document.getElementById('editeventlocationdiv');
var editeventopponentdiv = document.getElementById('editeventopponentdiv');

var editeventdate = document.getElementById('editeventdate');
var editeventtimestart = document.getElementById('editeventtimestart');
var editeventtimeend = document.getElementById('editeventtimeend');
var editeventlocation = document.getElementById('editeventlocation');
var editeventopponent = document.getElementById('editeventopponent');

var editeventaster = document.getElementById('editeventaster');
var editdateaster = document.getElementById('editdateaster');
var editstarttimeaster = document.getElementById('editstarttimeaster');
var editendtimeaster = document.getElementById('editendtimeaster');
var editlocationaster = document.getElementById('editlocationaster');
var editopponentaster = document.getElementById('editopponentaster');

var eventeditdate;
var eventeditstarttime;
var eventeditendtime;
var eventeditlocation;
var eventeditopponent;

var eventeditrow;
var eventeditaster = document.getElementById('eventeditaster');

var allowedlocation = /^[a-zA-Z ']+$/;

function selectEvent() {
	eventname = this.innerHTML;
	if (eventname === "Game") {
		document.getElementById("opponentdiv").style.display = "block";
		document.getElementById("selectgame").style.background = "green";
		document.getElementById("selectpractice").style.background = "none";
	}
	else {
		document.getElementById("opponentdiv").style.display = "none";
		document.getElementById("newopponent").value = "";
		document.getElementById("selectgame").style.background = "none";
		document.getElementById("selectpractice").style.background = "green";
	}
}

function editSelectEvent() {
	eventname = this.innerHTML;
	if (eventname === "Game") {
		editeventopponentdiv.style.display = "block";
		document.getElementById("editselectgame").style.background = "green";
		document.getElementById("editselectpractice").style.background = "none";
	}
	else {
		editeventopponentdiv.style.display = "none";
		document.getElementById("newopponent").value = "";
		document.getElementById("editselectgame").style.background = "none";
		document.getElementById("editselectpractice").style.background = "green";
	}
}

function makeEvent() {
	let eventdate = document.getElementById("neweventdate").value;
	let eventstarttime = document.getElementById("neweventtimestart").value;
	let eventendtime = document.getElementById("neweventtimeend").value;

	console.log("Start time: " + eventstarttime);
	console.log("End time: " + eventendtime);

	let eventlocation = document.getElementById("neweventlocation").value;
	let eventopponent = document.getElementById("newopponent").value;

	if (eventname === null) {
		document.getElementById('eventaster').style.display = "inline";
		eventstatus = false;
	}
	else {
		document.getElementById('eventaster').style.display = "none";
	}
	if (eventdate === "") {
		document.getElementById('dateaster').style.display = "inline";
		eventstatus = false;
	}
	else {
		document.getElementById('dateaster').style.display = "none";
	}
	if (eventstarttime === "") {
		document.getElementById('starttimeaster').style.display = "inline";
		eventstatus = false;
	}
	else {
		document.getElementById('starttimeaster').style.display = "none";
	}
	if (eventendtime === "") {
		document.getElementById('endtimeaster').style.display = "inline";
		eventstatus = false;
	}
	else {
		document.getElementById('endtimeaster').style.display = "none";
	}
	if (eventlocation === "" || eventlocation.match(allowedlocation) === null) {
		document.getElementById('locationaster').style.display = "inline";
		eventstatus = false;
	}
	else {
		document.getElementById('locationaster').style.display = "none";
	}
	if (eventname === "Game" && (eventopponent === "" || eventopponent.match(allowedlocation) === null)) {
		document.getElementById('opponentaster').style.display = "inline";
		eventstatus = false;
	}
	else {
		document.getElementById('opponentaster').style.display = "none";
	}

	if (eventstatus) {
		let newobj = {
			"Event" : eventname,
			"Date" : eventdate,
			"Start Time" : eventstarttime,
			"End Time" : eventendtime,
			"Location" : eventlocation
		}
		if (eventname === "Game") {
			newobj.Opponent = eventopponent;
		}
		schedule.push(newobj);

		let newrow = eventtable.insertRow(eventtable.rows.length - 1);
		let newnamesection = newrow.insertCell();
		let newdatesection = newrow.insertCell();
		let newstarttimesection = newrow.insertCell();
		let newendtimesection = newrow.insertCell();
		let newlocationsection = newrow.insertCell();
		let newopponentsection = newrow.insertCell();
		let neweditcell = newrow.insertCell();
		let newdeletecell = newrow.insertCell();

		let newname = document.createElement('p');
		newname.innerHTML = eventname;
		let newdate = document.createElement('p');
		newdate.innerHTML = eventdate;
		let newstarttime = document.createElement('p');
		newstarttime.innerHTML = eventstarttime;
		let newendtime = document.createElement('p');
		newendtime.innerHTML = eventendtime;
		let newlocation = document.createElement('p');
		newlocation.innerHTML = capitalizeName(eventlocation);
		let newopponent = document.createElement('p');
		newopponent.innerHTML = capitalizeName(eventopponent);

		newnamesection.appendChild(newname);
		newdatesection.appendChild(newdate);
		newstarttimesection.appendChild(newstarttime);
		newendtimesection.appendChild(newendtime);
		newlocationsection.appendChild(newlocation);
		newopponentsection.appendChild(newopponent);
		
		let neweditbutton = document.createElement('button');
		neweditbutton.addEventListener("click",editEvent);
		neweditbutton.innerHTML = "Edit";
		neweditcell.appendChild(neweditbutton);

		let newdeletebutton = document.createElement('button');
		newdeletebutton.addEventListener("click",deleteEvent); 
		newdeletebutton.innerHTML = "Delete";
		newdeletecell.appendChild(newdeletebutton);

		document.getElementById("neweventdate").value="";
		document.getElementById("neweventtimestart").value="";
		document.getElementById("neweventtimeend").value="";
		document.getElementById("neweventlocation").value="";
		eventname = null;
		document.getElementById("newopponent").value = "";
		document.getElementById("selectgame").style.background = "none";
		document.getElementById("selectpractice").style.background = "none";
	}
}

function editEvent() {
	eventeditrow = this.parentNode.parentNode;

	eventeditname = eventeditrow.cells[0].childNodes[0].innerHTML;
	eventeditrow.cells[0].childNodes[0].style.display = "none";
	eventeditrow.cells[0].appendChild(editeventnamediv);
	editeventnamediv.style.display = "table-cell";

	eventeditdate = eventeditrow.cells[1].childNodes[0].innerHTML;
	eventeditrow.cells[1].childNodes[0].style.display = "none";
	eventeditrow.cells[1].appendChild(editeventdatediv);
	editeventdatediv.style.display = "table-cell";
	editeventdate.value = eventeditdate;

	eventeditstarttime = eventeditrow.cells[2].childNodes[0].innerHTML;
	eventeditrow.cells[2].childNodes[0].style.display = "none";
	eventeditrow.cells[2].appendChild(editeventtimestartdiv);
	editeventtimestartdiv.style.display = "table-cell";
	editeventtimestart.value = eventeditstarttime;

	eventeditendtime = eventeditrow.cells[3].childNodes[0].innerHTML;
	eventeditrow.cells[3].childNodes[0].style.display = "none";
	eventeditrow.cells[3].appendChild(editeventtimeenddiv);
	editeventtimeenddiv.style.display = "table-cell";
	editeventtimeend.value = eventeditendtime;

	eventeditlocation = eventeditrow.cells[4].childNodes[0].innerHTML;
	eventeditrow.cells[4].childNodes[0].style.display = "none";
	eventeditrow.cells[4].appendChild(editeventlocationdiv);
	editeventlocationdiv.style.display = "table-cell";
	editeventlocation.value = eventeditlocation;

	eventeditopponent = eventeditrow.cells[5].childNodes[0].innerHTML;
	eventeditrow.cells[5].childNodes[0].style.display = "none";
	eventeditrow.cells[5].appendChild(editeventopponentdiv);
	editeventopponent.value = eventeditopponent;

	if (eventeditname === "Game") {
		document.getElementById("editselectgame").style.background = "green";
		eventname = "Game";
		editeventopponentdiv.style.display = "table-cell";
	}
	else if (eventeditname === "Practice") {
		document.getElementById("editselectpractice").style.background = "green";
		eventname = "Practice";
		editeventopponentdiv.style.display = "none";
	}

	eventeditrow.cells[6].appendChild(eventeditaster);

	document.getElementById('eventinputrow').style.display = "none";
	//Why did i add this
	document.getElementById("opponentdiv").style.display = "none";

	for (let i = 1; i < eventtable.rows.length - 1; i++) {
		$(eventtable.rows[i].cells[6]).children('button')[0].style.display = "none";
		$(eventtable.rows[i].cells[7]).children('button')[0].style.display = "none";
	}

	$(eventeditrow.cells[6]).children('button')[0].innerHTML = "Check";
	$(eventeditrow.cells[6]).children('button')[0].removeEventListener("click", editEvent);
	$(eventeditrow.cells[6]).children('button')[0].addEventListener("click", saveEventChanges);


	$(eventeditrow.cells[6]).children('button')[0].style.display = "table-cell";
	$(eventeditrow.cells[7]).children('button')[0].style.display = "table-cell";

	pagestatus = false;
}

function saveEventChanges() {
	eventeditaster.style.display = "none";

	let editedeventdate = editeventdate.value;
	let editedeventstarttime = editeventtimestart.value;
	let editedeventendtime = editeventtimeend.value;
	let editedeventlocation = editeventlocation.value;
	let editedeventopponent = editeventopponent.value;

	if (eventname === null) {
		editeventaster.style.display = "inline";
		savestatus = false;
	}
	else {
		editeventaster.style.display = "none";
	}
	if (editedeventdate === "") {
		editdateaster.style.display = "inline";
		savestatus = false;
	}
	else {
		editdateaster.style.display = "none";
	}
	if (editedeventstarttime === "") {
		editstarttimeaster.style.display = "inline";
		savestatus = false;
	}
	else {
		editstarttimeaster.style.display = "none";
	}
	if (editedeventendtime === "") {
		editendtimeaster.style.display = "inline";
		savestatus = false;
	}
	else {
		editendtimeaster.style.display = "none";
	}
	if (editedeventlocation === "" || editedeventlocation.match(allowedlocation) === null) {
		editlocationaster.style.display = "inline";
		savestatus = false;
	}
	else {
		editlocationaster.style.display = "none";
	}
	if (eventname === "Game" && (editedeventopponent === "" || editedeventopponent.match(allowedlocation) === null)) {
		editopponentaster.style.display = "inline";
		savestatus = false;
	}
	else {
		editopponentaster.style.display = "none";
	}

	if (savestatus) {
		document.getElementById("editselectgame").style.background = "none";
		document.getElementById("editselectpractice").style.background = "none";

		if (eventname === "Practice") {
			for (let i = 0; i < schedule.length; i++) {
				if (schedule[i]["Date"] === eventeditdate) {
					schedule[i] = {};
					schedule[i] = {
						"Event" : eventname,
						"Date" : editedeventdate,
						"Start Time" : editedeventstarttime,
						"End Time" : editedeventendtime,
						"Location" : capitalizeName(editedeventlocation)
					}
				}
			}

			eventeditrow.cells[5].childNodes[0].innerHTML = "";		
		}
		else if (eventname === "Game") {
			for (let i = 0; i < schedule.length; i++) {
				if (schedule[i]["Date"] === eventeditdate) {
					schedule[i] = {};
					schedule[i] = {
						"Event" : eventname,
						"Date" : editedeventdate,
						"Start Time" : editedeventstarttime,
						"End Time" : editedeventendtime,
						"Location" : capitalizeName(editedeventlocation),
						"Opponent" : capitalizeName(editedeventopponent)
					}
				}
			}
			eventeditrow.cells[5].childNodes[0].innerHTML = capitalizeName(editedeventopponent);
		}

		eventdiv.appendChild(editeventnamediv);
		eventdiv.appendChild(editeventdatediv);
		eventdiv.appendChild(editeventtimestartdiv);
		eventdiv.appendChild(editeventtimeenddiv);
		eventdiv.appendChild(editeventlocationdiv);
		eventdiv.appendChild(editeventopponentdiv);
		editeventnamediv.style.display = "none";
		editeventdatediv.style.display = "none";
		editeventtimestartdiv.style.display = "none";
		editeventtimeenddiv.style.display = "none";
		editeventlocationdiv.style.display = "none";
		editeventopponentdiv.style.display = "none";

		eventeditrow.cells[0].childNodes[0].innerHTML = eventname;
		eventeditrow.cells[1].childNodes[0].innerHTML = editedeventdate;
		eventeditrow.cells[2].childNodes[0].innerHTML = editedeventstarttime;
		eventeditrow.cells[3].childNodes[0].innerHTML = editedeventendtime;	
		eventeditrow.cells[4].childNodes[0].innerHTML = capitalizeName(editedeventlocation);	

		eventeditrow.cells[0].childNodes[0].style.display = "table-cell";
		eventeditrow.cells[1].childNodes[0].style.display = "table-cell";
		eventeditrow.cells[2].childNodes[0].style.display = "table-cell";
		eventeditrow.cells[3].childNodes[0].style.display = "table-cell";
		eventeditrow.cells[4].childNodes[0].style.display = "table-cell";
		eventeditrow.cells[5].childNodes[0].style.display = "table-cell";


		document.getElementById('eventinputrow').style.display = "table-row";

		$(eventeditrow.cells[6]).children('button')[0].innerHTML = "Edit";
		$(eventeditrow.cells[6]).children('button')[0].removeEventListener("click", saveEventChanges);
		$(eventeditrow.cells[6]).children('button')[0].addEventListener("click", editEvent);


		for (let i = 1; i < eventtable.rows.length - 1; i++) {
			$(eventtable.rows[i].cells[6]).children('button')[0].style.display = "table-cell";
			$(eventtable.rows[i].cells[7]).children('button')[0].style.display = "table-cell";
		}

		eventname = null;
		pagestatus = true;
	}
}

function deleteEvent() {
	//Add in code to move editing elements to the div
	eventdiv.appendChild(editeventnamediv);
	eventdiv.appendChild(editeventdatediv);
	eventdiv.appendChild(editeventtimestartdiv);
	eventdiv.appendChild(editeventtimeenddiv);
	eventdiv.appendChild(editeventlocationdiv);
	eventdiv.appendChild(editeventopponentdiv);
	eventdiv.appendChild(eventeditaster);

	editeventnamediv.style.display = "none";
	editeventdatediv.style.display = "none";
	editeventtimestartdiv.style.display = "none";
	editeventtimeenddiv.style.display = "none";
	editeventlocationdiv.style.display = "none";
	editeventopponentdiv.style.display = "none";
	eventeditaster.style.display = "none";

	let eventtodelete = this.parentNode.parentNode.childNodes[1].childNodes[0].innerHTML;

	for (let i = 0; i < schedule.length; i++) {
	 	if (schedule[i]["Date"] === eventtodelete) {
	 		schedule.splice(i,1);
		}
	}

	for (let i = 1; i < eventtable.rows.length - 1; i++) {
	 	$(eventtable.rows[i].cells[6]).children('button')[0].style.display = "table-cell";
	 	$(eventtable.rows[i].cells[7]).children('button')[0].style.display = "table-cell";
	}

	this.parentNode.parentNode.remove();
	document.getElementById('eventinputrow').style.display = "table-row";
	editopponentaster.style.display = "none";
	pagestatus = true;
}

function saveEvents() {
	if (pagestatus) {
		eventeditaster.style.display = "none";
		let promarray = [];

		for (let i = 0; i < schedule.length; i++) {
			let pushkey = database.ref('/teamslist/' + teamkey + '/schedule/').push().key;
			let updates = {};
			updates[pushkey] = schedule[i];

			let pushevent = database.ref('/teamslist/' + teamkey + '/schedule/')
				.update(updates)
				.then(() => {
					console.log("Event pushed to schedule");
				});

			promarray.push(pushevent);

			//push schedule object to firebase
			if (schedule[i]["Event"] === "Practice") {
				promarray.push(
					database.ref('/teamslist/' + teamkey + '/practices/' + pushkey)
						.set({
							Date: schedule[i]["Date"],
							Status: 0
						})
						.then(() => {
							console.log("Event pushed to practice list");
						})
				);
			}
			else if (schedule[i]["Event"] === "Game") {
				promarray.push(
					database.ref('/teamslist/' + teamkey + '/games/' + pushkey)
						.set({
							Date: schedule[i]["Date"],
							Status: 0
						})
						.then(() => {
							console.log("Event pushed to game list");
						})
				);
			}
		}

		Promise.all(promarray)
			.then(() => {
				let updates = {};
				updates['/organizationslist/' + localStorage.currentorganization + '/complete/'] = true;
				updates['/orgteamstatus/' + currentUser.uid + '/1/'] = true;

				database.ref()
					.update(updates)
					.then(() => {
						console.log("Organization updated to complete and orgteamstatus[1] set to true");
						localStorage.removeItem("orgteamstatus");
						localStorage.removeItem("currentteam");
						localStorage.removeItem("currentorganization")
						window.location.href = "../HTML/my_organizations.html";
					})
					.catch(error => {
						console.log("Organization not updated to complete / orgteamstatus[1] not set to true");
						console.log(error.message);
						console.error("Error code: " + error.code);
					});
			})
			.catch(error => {
				console.log(error.message);
				console.error("Error code: " + error.code);
			});
	}
	else {
		eventeditaster.style.display = "inline";
	}
}