window.$ = window.jQuery = nodeRequire('jquery');

//Old stuff?
var indexofpractice;
var practicingarray = [];
var currentsequence;

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
//Window.innerHeight is 647

document.getElementById("choosedrill").addEventListener("click", choosePressure);
document.getElementById("choosescrimmage").addEventListener("click", choosePressure);

var playerdropdowndiv = document.getElementById("playerdropdowndiv");
var eventtype = localStorage.currentevent.split(",")[0].toLowerCase() + "s";
var eventkey = localStorage.currentevent.split(",")[1];

window.onload = function loadstuff() {
	database.ref('/teamslist/' + localStorage.currentteam).once("value", function(teamdata) {
		let playerslist = teamdata.val()[eventtype][eventkey]["Player Status"];

		let playerdata = [];

		for (const player in playerslist) {
			if (playerslist[player] === "Practicing") {
				//Fix stuff	
				let newplayerelem = document.createElement("p");
				newplayerelem.innerHTML = teamdata.val()["players"][player]["Name"];
				newplayerelem.id = player;
				newplayerelem.addEventListener("click", choosePlayer)
				playerdropdowndiv.appendChild(newplayerelem);

				let newplayerdata = {
					"Player" : player,
				};
				playerdata.push(newplayerdata)
				practicingarray.push(player);
			}
		}

		currentsequence = teamdata.val()[eventtype][eventkey]["State"]["Current Sequence"];
		currentevent = teamdata.val()[eventtype][eventkey]["State"]["Current Event"];	
	}, function (error) {
		console.error("Player list not pulled from database");
		console.log(error.message);
		console.log("Error code: " + error.code);
	});
}

var pressure = "Scrimmage";

function choosePressure() {
	pressure = this.value;
}

function colorHoop() {
	hoop.style.fill = "#FF6347";
}

function uncolorHoop() {
	hoop.style.fill = "none";
}

jss.set('#svgstuff', {
	'width': '' + .808124*window.innerHeight + 'px',
	'height': '' + .758714*window.innerHeight + 'px',
});

/////////////////////////////////////////
//Court SVG
var court = document.getElementById("courtgroup");
court.setAttribute('transform','scale(' + .808124*window.innerHeight/522.85602 + ',' + .758714*window.innerHeight/490.888 + ')');
var courtsvg = document.getElementById("court");
courtsvg.setAttribute('width',''+.808124*window.innerHeight+'');
courtsvg.setAttribute('height',''+.758714*window.innerHeight+'');

//Hoop SVG
var hoopgroup = document.getElementById("hoopgroup");
hoopgroup.setAttribute('transform','scale(' + .808124*window.innerHeight/522.85602 + ',' + .758714*window.innerHeight/490.888 + ')');
var hoopsvg = document.getElementById('hoopsvg');

//Hoop Hover properties
hoopsvg.setAttribute('onmouseout','uncolorHoop()');

courtsvg.addEventListener("click", inputData);
var numdec = 3;

var offsetobj = courtsvg.getBoundingClientRect();
var leftoffset = offsetobj.left;
var topoffset = offsetobj.top;

function inputData() {
	let courtloc = [parseFloat(((event.pageX - leftoffset)/offsetobj.width).toFixed(numdec)), parseFloat(((event.pageY - topoffset)/offsetobj.height).toFixed(numdec))];

	var dt = new Date();

	if (pressure === "Drill" && shotwasattempted === 0) {
		newevent = {
			"Action" : "",
			"Location" : courtloc,
			"Time" : [dt.getUTCHours(), dt.getUTCMinutes(), dt.getUTCSeconds(), dt.getUTCMilliseconds()]
		};
		
		playerdropdowndiv.style.display = "block";
		playerdropdowndiv.style.left = event.pageX + 'px'; //offsetobj.width*courtloc[0] + leftoffset + 'px';
		playerdropdowndiv.style.top = event.pageY + 'px';  //offsetobj.height*courtloc[1] + topoffset + 'px';
	}

	else if (pressure === "Scrimmage") {
		if (passwasattempted !== 1 && shotwasattempted !== 1) {
			playerdropdowndiv.style.display = "block";
			playerdropdowndiv.style.left = event.pageX + 'px';
			playerdropdowndiv.style.top = event.pageY + 'px';
		}

		if (passoccurred === 0 && dribbleoccurred === 0 && (abletopass + abletoshoot + abletodribble + abletorebound) === 0 && passwasattempted === 0) {
			newevent = {
				"Sequence" : currentsequence,
				"Event" : currentevent,
				"Location" : courtloc,
				"Time" : [dt.getUTCHours(), dt.getUTCMinutes(), dt.getUTCSeconds(), dt.getUTCMilliseconds()],
				"Origin" : "Play Start"
			};
		}

		else if (abletorebound === 1) {
			newevent["Rebounded"] = "Yes";
			newevent["Rebound Location"] = courtloc;

			let pushkey = database.ref().push().key;
			let updates = {};
			updates[pushkey] = newevent;

			database.ref('/teamslist/' + localStorage.currentteam + '/' + eventtype + '/' + eventkey + '/Data/' + currentplayer + '/ScrimmagePressure/')
				.update(updates)
				.then(() => {
					console.log("Event pushed to database");
		
					abletorebound = 0;
					currentevent = 0;
					currentsequence += 1;

					database.ref('/teamslist/' + localStorage.currentteam + '/' + eventtype + '/' + eventkey + '/State/')
						.set({
							"Current Sequence" : currentsequence,
							"Current Event" : 0
						})
						.then(() => {
							console.log("Current Sequence and Event updated");
						})
						.catch(error => {
							console.error("Current Sequence and Event not updated");
							console.log(error.message);
							console.log("Error code: " + error.code);
						});

					newevent = {};
					newevent = {
						"Sequence" : currentsequence,
						"Event" : currentevent,
						"Location" : courtloc,
						"Time" : [dt.getUTCHours(), dt.getUTCMinutes(), dt.getUTCSeconds(), dt.getUTCMilliseconds()],
						"Origin" : "Rebound"
					};

					drawReboundArrow(newevent["Location"][0]*offsetobj.width,newevent["Location"][1]*offsetobj.height);
					notrebbutton.style.display = "none";
					currentplayer = null;
				})
				.catch(error => {
					console.error("Event not pushed to database");
					console.log(error.message);
					console.log("Error code: " + error.code);
				});
		}

		else if (abletopass === 1 && passoccurred === 0 && passwasattempted === 0 && dribbleoccurred === 0) {
			passwasattempted = 1;

			newevent2 = {
				"Sequence" : currentsequence,
				"Event" : currentevent + "-b",
				"Location" : courtloc,
				"Time" : [dt.getUTCHours(), dt.getUTCMinutes(), dt.getUTCSeconds(), dt.getUTCMilliseconds()],
				"From" : currentplayer
			};

			newevent["Event"] += "-a";

			abletopass = 0;
			abletoshoot = 0;
			abletodribble = 0;

			hoopsvg.setAttribute('onmouseover','');
			document.getElementById(currentplayer).style.display = "none";
		}

		else if (abletopass === 1 && passoccurred === 0 && passwasattempted === 0 && dribbleoccurred === 1) {
			let pushkey = database.ref().push().key;
			let updates = {};
			updates[pushkey] = newevent;

			database.ref('/teamslist/' + localStorage.currentteam + '/' + eventtype + '/' + eventkey + '/Data/' + currentplayer + '/ScrimmagePressure/')
				.update(updates)
				.then(() => {
					console.log("Event pushed to database");

					passwasattempted = 1;

					abletoshoot = 0;
					abletopass = 0;
					abletodribble = 0;
					
					hoopsvg.setAttribute('onmouseover','');

					dribbleoccurred = 0;

					var lastlocation = newevent["Location"][newevent["Location"].length - 1];

					newevent = {};
					newevent = {
						"Sequence" : currentsequence,
						"Event" : currentevent + "-a",
						"Location" : [lastlocation[0],lastlocation[1]],
						"Time" : [dt.getUTCHours(), dt.getUTCMinutes(), dt.getUTCSeconds(), dt.getUTCMilliseconds()]
					};

					newevent2 = {
						"Sequence" : currentsequence,
						"Event" : currentevent + "-b",
						"Location" : courtloc,
						"Time" : [dt.getUTCHours(), dt.getUTCMinutes(), dt.getUTCSeconds(), dt.getUTCMilliseconds()],
						"From" : currentplayer
					};

					document.getElementById(currentplayer).style.display = "none";
					xbutton.style.display = "none";
				})
				.catch(error => {
					console.error("Event not pushed to database");
					console.log(error.message);
					console.log("Error code: " + error.code);
				});
		}

		else if (abletopass === 1 && passoccurred === 1 && passwasattempted === 0 && dribbleoccurred === 0) {
			passoccurred = 0;
			passwasattempted = 1;

			abletopass = 0;
			abletodribble = 0;
			abletoshoot = 0;

			hoopsvg.setAttribute('onmouseover','');
			
			newevent["Action"] = "Pass Made";
			newevent2["Action"] = "Pass Received";

			let pushkey1 = database.ref().push().key;
			let pushkey2 = database.ref().push().key;
			let updates = {};
			updates[currentplayer + "/ScrimmagePressure/" + pushkey1] = newevent;
			updates[player1 + "/ScrimmagePressure/" + pushkey2] = newevent2;

			database.ref('/teamslist/' + localStorage.currentteam + '/' + eventtype + '/' + eventkey + '/Data/')
				.update(updates)
				.then(() => {
					console.log("Event pushed to database");
		
					currentplayer = player1;
					player1 = null;

					newevent = {};

					newevent = {
						"Sequence" : currentsequence,
						"Event" : currentevent + "-a",
						"Location" : [newevent2["Location"][0],newevent2["Location"][1]],
						"Time" : [dt.getUTCHours(), dt.getUTCMinutes(), dt.getUTCSeconds(), dt.getUTCMilliseconds()],
						"Action" : "Dribble"
					};

					newevent2 = {};

					newevent2 = {
						"Sequence" : currentsequence,
						"Event" : currentevent + "-b",
						"Location" : courtloc,
						"Time" : [dt.getUTCHours(), dt.getUTCMinutes(), dt.getUTCSeconds(), dt.getUTCMilliseconds()],
						"From" : currentplayer
					};

					document.getElementById(currentplayer).style.display = "none";
				})
				.catch(error => {
					console.error("Event not pushed to database");
					console.log(error.message);
					console.log("Error code: " + error.code);
				});
		}
	}
}

function choosePlayer() {
	playerdropdowndiv.style.display = "none";

	if (pressure === "Drill") {
		console.log('drillchoose');

		currentplayer = this.id;

		d3.select("#circles").append('svg')
							.attr('id','circle0')
							.attr('width',circlesvgwidth)
							.attr('height',circlesvgwidth)
							.attr('class','circleforplayers')
							.style('left',newevent["Location"][0]*offsetobj.width + leftoffset - circleradius)
							.style('top',newevent["Location"][1]*offsetobj.height + topoffset - circleradius)
							.style('display','block')
							.append('circle')
							.attr('cx',.5*circlesvgwidth)
							.attr('cy',.5*circlesvgwidth)
							.attr('r',.0231839*window.innerHeight);
		d3.select("#circle0").append('text')
							.attr('x','50%')
							.attr('y','65%')
							.attr('text-anchor','middle')
							.style('stroke-width','0')
							.style('fill','#000')
							.style('font-size',.02163833*window.innerHeight)
							.text(getInitials(this.innerHTML));

		d3.select("#circles").style('display','block');

		drawShotArrow(newevent["Location"][0]*offsetobj.width,newevent["Location"][1]*offsetobj.height);
		checkbutton.setAttribute('data-action',"Shot Made");
		xbutton.setAttribute('data-action',"Shot Missed");

		shotwasattempted = 1;

		currentcircle += 1;
	}

	else if (pressure === "Scrimmage") {
		if (currentevent === 0 && (abletopass + abletoshoot + abletodribble) === 0 && passwasattempted === 0) {
			currentplayer = this.id;
			abletoshoot = 1;
			abletopass = 1;
			abletodribble = 1;
		
			hoopsvg.setAttribute('onmouseover','colorHoop()');

			drawNextCircle(this.innerHTML, newevent["Location"][0]*offsetobj.width + leftoffset, newevent["Location"][1]*offsetobj.height + topoffset);

			var currentplayerid = currentplayer.toLowerCase().replace(" ","");
			document.getElementById(currentplayer).style.display = "none";
		}

		else if (passwasattempted === 1 && dribbleoccurred === 0) {
			document.getElementById(currentplayer).style.display = "block";

			player1 = this.id;

			drawNextCircle(this.innerHTML, newevent2["Location"][0]*offsetobj.width + leftoffset, newevent2["Location"][1]*offsetobj.height + topoffset);
			drawPassArrow(newevent["Location"][0]*offsetobj.width, newevent["Location"][1]*offsetobj.height, newevent2["Location"][0]*offsetobj.width, newevent2["Location"][1]*offsetobj.height);

			newevent["To"] = player1;

			currentevent += 1;

			database.ref('/teamslist/' + localStorage.currentteam + '/' + eventtype + '/' + eventkey + '/State/Current Event')
				.set(currentevent)
				.then(() => {
					console.log("Current Event updated");
				})
				.catch(error => {
					console.error("Current Event not updated");
					console.log(error.message);
					console.log("Error code: " + error.code);
				});

			abletopass = 1;
			abletoshoot = 1;
			abletodribble = 1;

			hoopsvg.setAttribute('onmouseover','colorHoop()');

			passwasattempted = 0;
			passoccurred = 1;

			actionbuttons.style.display = "block";
			ooboppbutton.style.display = "none";
			oobourbutton.style.display = "none";
			opponentbutton.style.display = "none";
			notrebbutton.style.display = "none";
			checkbutton.style.display = "none";
			xbutton.style.display = "block";
			xbutton.setAttribute('data-action',"Pass Missed");
			document.getElementById(player1).style.display = "none";
		}
	}
}

function chooseAction() {
	if (pressure === "Drill") {
		newevent["Action"] = this.dataset.action;

		let pushkey = database.ref().push().key;
		let updates = {};
		updates[pushkey] = newevent;

		database.ref('/teamslist/' + localStorage.currentteam + '/' + eventtype + '/' + eventkey + '/Data/' + currentplayer + '/DrillPressure/')
			.update(updates)
			.then(() => {
				console.log("Event pushed to database");
				actionbuttons.style.display = "none";

				d3.select("#shots").selectAll("*").remove();
				d3.select("#circle0").remove();

				newevent = {};
				shotwasattempted = 0;
			})
			.catch(error => {
				console.error("Event not pushed to database");
				console.log(error.message);
				console.log("Error code: " + error.code);
			});
	}

	else if (pressure === "Scrimmage") {
		if (shotwasattempted === 1 && this.dataset.action === "Shot Made") {
			newevent["Action"] = this.dataset.action;

			let pushkey = database.ref().push().key;
			let updates = {};
			updates[pushkey] = newevent;

			database.ref('/teamslist/' + localStorage.currentteam + '/' + eventtype + '/' + eventkey + '/Data/' + currentplayer + '/ScrimmagePressure/')
				.update(updates)
				.then(() => {
					console.log("Event pushed to database");

					d3.select("#shots").selectAll("*").remove();
					d3.select("#passes").selectAll("*").remove();
					d3.select("#dribbles").selectAll("*").remove();
					d3.select("#rebounds").selectAll("*").remove();
					d3.select("#circles").selectAll("*").remove();
					currentcircle = 0;
					currentpass = 0;
					currentdribble = 0;
					currentshot = 0;
					currentrebound = 0;

					checkbutton.style.display = "none";
					xbutton.style.display = "none";

					newevent = {};
					shotwasattempted = 0;
					currentevent = 0;
					currentsequence += 1;

					database.ref('/teamslist/' + localStorage.currentteam + '/' + eventtype + '/' + eventkey + '/State/')
						.set({
							"Current Sequence" : currentsequence,
							"Current Event" : 0
						})
						.then(() => {
							console.log("Current Sequence and Event updated");
						})
						.catch(error => {
							console.error("Current Sequence and Event not updated");
							console.log(error.message);
							console.log("Error code: " + error.code);
						});

					currentplayer = null;
				})
				.catch(error => {
					console.error("Event not pushed to database");
					console.log(error.message);
					console.log("Error code: " + error.code);
				});
		}

		else if (shotwasattempted === 1 && this.dataset.action === "Shot Missed") {
			newevent["Action"] = this.dataset.action;

			notrebbutton.style.display = "block";
			checkbutton.style.display = "none";
			xbutton.style.display = "none";
			document.getElementById(currentplayer).style.display = "block";
			shotwasattempted = 0;
			abletorebound = 1;
		}

		else if (this.dataset.action === "Pass Missed") {
			xbutton.style.display = "none";
			ooboppbutton.style.display = "inline";
			oobourbutton.style.display = "inline";
			opponentbutton.style.display = "inline";

			passoccurred = 0;
			currentevent = 0;
			currentsequence += 1;

			database.ref('/teamslist/' + localStorage.currentteam + '/' + eventtype + '/' + eventkey + '/State/')
				.set({
					"Current Sequence" : currentsequence,
					"Current Event" : 0
				})
				.then(() => {
					console.log("Current Sequence and Event updated");
				})
				.catch(error => {
					console.error("Current Sequence and Event not updated");
					console.log(error.message);
					console.log("Error code: " + error.code);
				});

			abletoshoot = 0;
			abletodribble = 0;
			abletopass = 0;

			hoopsvg.setAttribute('onmouseover','');
		}

		else if (this.dataset.action === "Dribble Stolen") {
			newevent["Action"] = this.dataset.action;

			let pushkey = database.ref().push().key;
			let updates = {};
			updates[pushkey] = newevent;

			database.ref('/teamslist/' + localStorage.currentteam + '/' + eventtype + '/' + eventkey + '/Data/' + currentplayer + '/ScrimmagePressure/')
				.update(updates)
				.then(() => {
					console.log("Event pushed to database");
		
					xbutton.style.display = "none";

					dribbleoccurred = 0;
					currentevent = 0;
					currentsequence += 1;

					database.ref('/teamslist/' + localStorage.currentteam + '/' + eventtype + '/' + eventkey + '/State/')
						.set({
							"Current Sequence" : currentsequence,
							"Current Event" : 0
						})
						.then(() => {
							console.log("Current Sequence and Event updated");
						})
						.catch(error => {
							console.error("Current Sequence and Event not updated");
							console.log(error.message);
							console.log("Error code: " + error.code);
						});

					abletoshoot = 0;
					abletodribble = 0;
					abletopass = 0;

					hoopsvg.setAttribute('onmouseover','');

					d3.select("#shots").selectAll("*").remove();
					d3.select("#passes").selectAll("*").remove();
					d3.select("#dribbles").selectAll("*").remove();
					d3.select("#rebounds").selectAll("*").remove();
					d3.select("#circles").selectAll("*").remove();
					currentcircle = 0;
					currentpass = 0;
					currentdribble = 0;
					currentshot = 0;
					currentrebound = 0;

					document.getElementById(currentplayer).style.display = "block";
					currentplayer = null;
				})
				.catch(error => {
					console.error("Event not pushed to database");
					console.log(error.message);
					console.log("Error code: " + error.code);
				});
		}
	}
}

function inputDribble() {
	var dt = new Date();

	hoopsvg.setAttribute('onmouseover','');

	if (abletodribble === 1 && passoccurred === 0 && dribbleoccurred == 0) {
		newevent["Action"] = "Dribble";
		newevent["Location"] = [newevent["Location"]];
	}

	else if (abletodribble === 1 && dribbleoccurred === 1 && passoccurred === 0) {
		let pushkey = database.ref().push().key;
		let updates = {};
		updates[pushkey] = newevent;

		database.ref('/teamslist/' + localStorage.currentteam + '/' + eventtype + '/' + eventkey + '/Data/' + currentplayer + '/ScrimmagePressure/')
			.update(updates)
			.then(() => {
				console.log("Event pushed to database");
				var lastlocation = newevent["Location"][newevent["Location"].length - 1];

				newevent = {};
				newevent = {
					"Sequence" : currentsequence,
					"Event" : currentevent,
					"Location" : [[lastlocation[0],lastlocation[1]]],
					"Time" : [dt.getUTCHours(), dt.getUTCMinutes(), dt.getUTCSeconds(), dt.getUTCMilliseconds()]
				};

				newevent["Action"] = "Dribble";
			})
			.catch(error => {
				console.error("Event not pushed to database");
				console.log(error.message);
				console.log("Error code: " + error.code);
			});
	}

	else if (abletodribble === 1 && dribbleoccurred === 0 && passoccurred === 1) {
		passoccurred = 0;

		newevent["Action"] = "Pass Made";
		newevent2["Action"] = "Pass Received";

		let pushkey1 = database.ref().push().key;
		let pushkey2 = database.ref().push().key;
		let updates = {};
		updates[currentplayer + "/ScrimmagePressure/" + pushkey1] = newevent;
		updates[player1 + "/ScrimmagePressure/" + pushkey2] = newevent2;

		database.ref('/teamslist/' + localStorage.currentteam + '/' + eventtype + '/' + eventkey + '/Data/')
			.update(updates)
			.then(() => {
				console.log("Event pushed to database");
			})
			.catch(error => {
				console.error("Event not pushed to database");
				console.log(error.message);
				console.log("Error code: " + error.code);
			});

		currentplayer = player1;
		player1 = null;
		
		newevent = {};
		newevent = {
			"Sequence" : currentsequence,
			"Event" : currentevent,
			"Location" : [newevent2["Location"]],
			"Time" : [dt.getUTCHours(), dt.getUTCMinutes(), dt.getUTCSeconds(), dt.getUTCMilliseconds()],
			"Action" : "Dribble"
		};
	}

	d3.select("#dribbles").style('display','block')
						.append('svg')
						.style('display','block')
						.attr('class','dribbleclass')
						.attr('width',.808124*window.innerHeight)
						.attr('height',.758714*window.innerHeight)
						.attr('id','dribble' + currentdribble + 'svg');

	d3.select("#dribble" + currentdribble + 'svg').append('line')
							.attr('id', 'dribble' + currentdribble + 'line1')
							.attr("x1", newevent["Location"][newevent["Location"].length - 1][0]*offsetobj.width)
							.attr("y1", newevent["Location"][newevent["Location"].length - 1][1]*offsetobj.height)
							.attr('x2', event.pageX - leftoffset)
							.attr('y2', event.pageY - topoffset);

	currentline = 0;
	locationtimer = 0;

	$(document).on( "mousemove", function( event ) {
		let courtloc = [parseFloat(((event.pageX - leftoffset)/offsetobj.width).toFixed(numdec)), parseFloat(((event.pageY - topoffset)/offsetobj.height).toFixed(numdec))];

		if (currentline === 0) {
			d3.select("#dribble" + currentdribble + "line1").attr('x2', event.pageX - leftoffset)
								.attr('y2', event.pageY - topoffset);
		}

		else if (currentline % 2 === 0) {
			d3.select("#dribble" + currentdribble + 'line' + currentline + '').attr('x2', event.pageX - leftoffset)
												.attr('y2', event.pageY - topoffset);
		}

		d3.select("#circle" + (currentcircle-1) + '').style('left',event.pageX - circleradius)
													.style('top',event.pageY - circleradius)
													.style("z-index",11);

		locationtimer += 1;		

		if (locationtimer === 4) {
			locationarray.push(courtloc);
			locationtimer = 0;
			currentline += 1;
			if (currentline % 2 === 0) {
				d3.select("#dribble" + currentdribble + 'svg').append('line')
										.attr('id', 'dribble' + currentdribble + 'line' + currentline + '')
										.attr("x1", locationarray[locationarray.length - 1][0]*offsetobj.width)
										.attr("y1", locationarray[locationarray.length - 1][1]*offsetobj.height)
										.attr('x2', event.pageX - leftoffset)
										.attr('y2', event.pageY - topoffset)
										.attr("stroke-width", 2)
										.attr("stroke", "blue");	
			}
		}
	});
}

function stopDribble() {
	let courtloc = [parseFloat(((event.pageX - leftoffset)/offsetobj.width).toFixed(numdec)), parseFloat(((event.pageY - topoffset)/offsetobj.height).toFixed(numdec))];

	locationarray.push(courtloc);

	d3.select("#circle" + (currentcircle-1) + '').style('left',event.pageX - circleradius)
												.style('top',event.pageY - circleradius)
												.style("z-index",1);

	$(document).off("mousemove");

	newevent["Location"] = newevent["Location"].concat(locationarray);

	actionbuttons.style.display = "block";
	ooboppbutton.style.display = "none";
	oobourbutton.style.display = "none";
	opponentbutton.style.display = "none";
	notrebbutton.style.display = "none";
	checkbutton.style.display = "none";
	xbutton.style.display = "block";
	xbutton.setAttribute('data-action','Dribble Stolen');
	//Not fixed value at 50
	actionbuttons.style.left = locationarray[locationarray.length -1][0]*offsetobj.width - (50/647)*window.innerHeight + 'px';
	actionbuttons.style.top = locationarray[locationarray.length -1][1]*offsetobj.width - (50/647)*window.innerHeight + 'px';

	locationarray = [];
	currentevent += 1;

	database.ref('/teamslist/' + localStorage.currentteam + '/' + eventtype + '/' + eventkey + '/State/Current Event')
		.set(currentevent)
		.then(() => {
			console.log("Current Event updated");
		})
		.catch(error => {
			console.error("Current Event not updated");
			console.log(error.message);
			console.log("Error code: " + error.code);
		});

	dribbleoccurred = 1;
	abletodribble = 1;
	abletopass = 1;
	abletoshoot = 1;

	currentdribble += 1;

	hoopsvg.setAttribute('onmouseover','colorHoop()');
}

function lossTo() {
	oobourbutton.style.display = "none";
	ooboppbutton.style.display = "none";
	opponentbutton.style.display = "none";

	newevent["Action"] = "Pass Missed";
	newevent["Loss To"] = this.dataset.reason;
	newevent2["Action"] = "Pass Not Received";
	newevent2["Loss To"] = this.dataset.reason;

	let pushkey1 = database.ref().push().key;
	let pushkey2 = database.ref().push().key;
	let updates = {};
	updates[currentplayer + "/ScrimmagePressure/" + pushkey1] = newevent;
	updates[player1 + "/ScrimmagePressure/" + pushkey2] = newevent2;

	database.ref('/teamslist/' + localStorage.currentteam + '/' + eventtype + '/' + eventkey + '/Data/')
		.update(updates)
		.then(() => {
			console.log("Event pushed to database");

			currentplayer = player1;
			player1 = null;
			document.getElementById(currentplayer).style.display = "block";
			currentplayer = null;

			d3.select("#shots").selectAll("*").remove();
			d3.select("#passes").selectAll("*").remove();
			d3.select("#dribbles").selectAll("*").remove();
			d3.select("#rebounds").selectAll("*").remove();
			d3.select("#circles").selectAll("*").remove();
			currentcircle = 0;
			currentpass = 0;
			currentdribble = 0;
			currentshot = 0;
			currentrebound = 0;

			newevent = {};
			newevent2 = {};
		})
		.catch(error => {
			console.error("Event not pushed to database");
			console.log(error.message);
			console.log("Error code: " + error.code);
		});
}

function notRebounded() {
	newevent["Rebounded"] = "No";

	let pushkey = database.ref().push().key;
	let updates = {};
	updates[pushkey] = newevent;

	database.ref('/teamslist/' + localStorage.currentteam + '/' + eventtype + '/' + eventkey + '/Data/' + currentplayer + '/ScrimmagePressure/')
		.update(updates)
		.then(() => {
			console.log("Event pushed to database");

			notrebbutton.style.display = "none";

			d3.select("#shots").selectAll("*").remove();
			d3.select("#passes").selectAll("*").remove();
			d3.select("#dribbles").selectAll("*").remove();
			d3.select("#rebounds").selectAll("*").remove();
			d3.select("#circles").selectAll("*").remove();
			currentcircle = 0;
			currentpass = 0;
			currentdribble = 0;
			currentshot = 0;
			currentrebound = 0;

			newevent = {};
			currentplayer = null;
			currentevent = 0;
			currentsequence += 1;

			database.ref('/teamslist/' + localStorage.currentteam + '/' + eventtype + '/' + eventkey + '/State/Current Sequence')
				.set(currentsequence)
				.then(() => {
					console.log("Current Sequence updated");
				})
				.catch(error => {
					console.error("Current Sequence not updated");
					console.log(error.message);
					console.log("Error code: " + error.code);
				});

			abletorebound = 0;
		})
		.catch(error => {
			console.error("Event not pushed to database");
			console.log(error.message);
			console.log("Error code: " + error.code);
		});
}

function chooseShot() {
	var dt = new Date();

	if (abletoshoot === 1 && shotwasattempted === 0 && passoccurred === 0 && dribbleoccurred === 0) {
		drawShotArrow(newevent["Location"][0]*offsetobj.width,newevent["Location"][1]*offsetobj.height);
		abletoshoot = 0;
		abletopass = 0;
		abletodribble = 0;
		shotwasattempted = 1;

		hoopsvg.setAttribute('onmouseover','');

		d3.select("#circle" + (currentcircle - 1) + '').attr('onmousedown','')
														.attr('onmouseup','');
	}

	else if (abletoshoot === 1 && shotwasattempted === 0 && passoccurred === 0 && dribbleoccurred === 1) {
		drawShotArrow(newevent["Location"][newevent["Location"].length - 1][0]*offsetobj.width,newevent["Location"][newevent["Location"].length - 1][1]*offsetobj.height);

		let pushkey = database.ref().push().key;
		let updates = {};
		updates[pushkey] = newevent;

		database.ref('/teamslist/' + localStorage.currentteam + '/' + eventtype + '/' + eventkey + '/Data/' + currentplayer + '/ScrimmagePressure/')
			.update(updates)
			.then(() => {
				console.log("Event pushed to database");
		
				abletoshoot = 0;
				abletopass = 0;
				abletodribble = 0;
				shotwasattempted = 1;

				hoopsvg.setAttribute('onmouseover','');

				d3.select("#circle" + (currentcircle - 1) + '').attr('onmousedown','')
																.attr('onmouseup','');

				dribbleoccurred = 0;

				var lastlocation = newevent["Location"][newevent["Location"].length - 1];

				newevent = {};
				newevent = {
					"Sequence" : currentsequence,
					"Event" : currentevent,
					"Location" : [lastlocation[0],lastlocation[1]],
					"Time" : [dt.getUTCHours(), dt.getUTCMinutes(), dt.getUTCSeconds(), dt.getUTCMilliseconds()]
				};
			})
			.catch(error => {
				console.error("Event not pushed to database");
				console.log(error.message);
				console.log("Error code: " + error.code);
			});
	}

	else if (abletoshoot === 1 && shotwasattempted === 0 && passoccurred === 1 && dribbleoccurred === 0) {
		drawShotArrow(newevent2["Location"][0]*offsetobj.width, newevent2["Location"][1]*offsetobj.height)

		newevent["Action"] = "Pass Made";
		newevent2["Action"] = "Pass Received";

		let pushkey1 = database.ref().push().key;
		let pushkey2 = database.ref().push().key;
		let updates = {};
		updates[currentplayer + "/ScrimmagePressure/" + pushkey1] = newevent;
		updates[player1 + "/ScrimmagePressure/" + pushkey2] = newevent2;

		database.ref('/teamslist/' + localStorage.currentteam + '/' + eventtype + '/' + eventkey + '/Data/')
			.update(updates)
			.then(() => {
				console.log("Event pushed to database");
	
				abletoshoot = 0;
				abletopass = 0;
				abletodribble = 0;
				shotwasattempted = 1;

				hoopsvg.setAttribute('onmouseover','');

				d3.select("#circle" + (currentcircle - 1) + '').attr('onmousedown','')
																.attr('onmouseup','');

				passoccurred = 0;	

				currentplayer = player1;
				player1 = null;

				newevent = {};
				newevent = {
					"Sequence" : currentsequence,
					"Event" : currentevent,
					"Location" : [newevent2["Location"][0],newevent2["Location"][1]],
					"Time" : [dt.getUTCHours(), dt.getUTCMinutes(), dt.getUTCSeconds(), dt.getUTCMilliseconds()]
				};
			})
			.catch(error => {
				console.error("Event not pushed to database");
				console.log(error.message);
				console.log("Error code: " + error.code);
			});
	}

	checkbutton.setAttribute('data-action',"Shot Made");
	xbutton.setAttribute('data-action',"Shot Missed");
	document.getElementById(currentplayer).style.display = "block";
}

function drawShotArrow(xloc,yloc) {
	//all of this is relative to top left corner of court
	var centerx = xloc;
	var centery = yloc;
    
	var diffx = hoopx - centerx;
	var diffy = hoopy - centery;

	var dist = Math.sqrt(Math.pow(diffx,2) + Math.pow(diffy,2));

	var unitvector = [(diffx/dist),(diffy/dist)];
	var vectortoinitialpoint = [circleradius*unitvector[0],circleradius*unitvector[1]];

	var x1 = centerx + vectortoinitialpoint[0];
	var y1 = centery + vectortoinitialpoint[1];

	var headmag = 15;
	var head = [headmag*unitvector[0],headmag*unitvector[1]];

	var head1vector = [Math.cos(Math.PI/6)*head[0] - Math.sin(Math.PI/6)*head[1],Math.cos(Math.PI/6)*head[1] + Math.sin(Math.PI/6)*head[0]];
	var head2vector = [Math.cos(11*Math.PI/6)*head[0] - Math.sin(11*Math.PI/6)*head[1],Math.cos(11*Math.PI/6)*head[1] + Math.sin(11*Math.PI/6)*head[0]];


	var head1x = hoopx-head1vector[0];
	var head1y = hoopy-head1vector[1];

	var head2x = hoopx-head2vector[0];
	var head2y = hoopy-head2vector[1];

	d3.select("#shots").style('display','block')
						.append('line')
						.attr('id','shot' + currentshot + 'mainline')
						.attr('x1',centerx)
						.attr('y1',centery)
						.attr('x2',hoopx)
						.attr('y2',hoopy);

	d3.select("#shots").append('line')
						.attr('id','shot' + currentshot + 'head1line')
						.attr('x1',head1x)
						.attr('y1',head1y)
						.attr('x2',hoopx)
						.attr('y2',hoopy);

	d3.select("#shots").append('line')
						.attr('id','shot' + currentshot + 'head2line')
						.attr('x1',head2x)
						.attr('y1',head2y)
						.attr('x2',hoopx)
						.attr('y2',hoopy);

	var posleft = hoopx + .5*(centerx - hoopx);
	var postop = hoopy + .5*(centery - hoopy);

	actionbuttons.style.top = postop + 'px';
	actionbuttons.style.left = posleft + 'px';
	actionbuttons.style.display = "block";
	ooboppbutton.style.display = "none";
	oobourbutton.style.display = "none";
	opponentbutton.style.display = "none";
	notrebbutton.style.display = "none";
	checkbutton.style.display = "inline";
	xbutton.style.display = "inline";

	currentshot += 1;
}

function drawReboundArrow(xloc,yloc) {
	var centerx = xloc;
	var centery = yloc;
    
	var diffx = centerx - hoopx;
	var diffy = centery - hoopy;

	var dist = Math.sqrt(Math.pow(diffx,2) + Math.pow(diffy,2));

	var unitvector = [(diffx/dist),(diffy/dist)];
	var vectortoinitialpoint = [circleradius*unitvector[0],circleradius*unitvector[1]];

	var x2 = centerx - vectortoinitialpoint[0];
	var y2 = centery - vectortoinitialpoint[1];


	var headmag = 15;
	var head = [headmag*unitvector[0],headmag*unitvector[1]];

	var head1vector = [Math.cos(Math.PI/6)*head[0] - Math.sin(Math.PI/6)*head[1],Math.cos(Math.PI/6)*head[1] + Math.sin(Math.PI/6)*head[0]];
	var head2vector = [Math.cos(11*Math.PI/6)*head[0] - Math.sin(11*Math.PI/6)*head[1],Math.cos(11*Math.PI/6)*head[1] + Math.sin(11*Math.PI/6)*head[0]];


	var head1x = x2-head1vector[0];
	var head1y = y2-head1vector[1];

	var head2x = x2-head2vector[0];
	var head2y = y2-head2vector[1];

	d3.select("#rebounds").style('display','block')
						.append('line')
						.attr('id','rebound' + currentrebound + 'mainline')
						.attr('x1',hoopx)
						.attr('y1',hoopy)
						.attr('x2',x2)
						.attr('y2',y2);

	d3.select("#rebounds").append('line')
						.attr('id','rebound' + currentrebound + 'head1line')
						.attr('x1',head1x)
						.attr('y1',head1y)
						.attr('x2',x2)
						.attr('y2',y2);

	d3.select("#rebounds").append('line')
						.attr('id','rebound' + currentrebound + 'head2line')
						.attr('x1',head2x)
						.attr('y1',head2y)
						.attr('x2',x2)
						.attr('y2',y2);

	var posleft = hoopx + .5*(centerx - hoopx);
	var postop = hoopy + .5*(centery - hoopy);

	currentrebound += 1;
}

function drawPassArrow(xi,yi,xf,yf) {	
	var diffx = xf - xi;
	var diffy = yf - yi;

	var dist = Math.sqrt(Math.pow(diffx,2) + Math.pow(diffy,2));

	var unitvector = [(diffx/dist),(diffy/dist)];
	var vectortoinitialpoint = [circleradius*unitvector[0],circleradius*unitvector[1]];

	var x1 = xi + vectortoinitialpoint[0];
	var y1 = yi + vectortoinitialpoint[1];

	var x2 = xf - vectortoinitialpoint[0];
	var y2 = yf - vectortoinitialpoint[1];

	var headmag = 15;
	var head = [headmag*unitvector[0],headmag*unitvector[1]];

	var head1vector = [Math.cos(Math.PI/6)*head[0] - Math.sin(Math.PI/6)*head[1],Math.cos(Math.PI/6)*head[1] + Math.sin(Math.PI/6)*head[0]];
	var head2vector = [Math.cos(11*Math.PI/6)*head[0] - Math.sin(11*Math.PI/6)*head[1],Math.cos(11*Math.PI/6)*head[1] + Math.sin(11*Math.PI/6)*head[0]];


	var head1x = x2-head1vector[0];
	var head1y = y2-head1vector[1];

	var head2x = x2-head2vector[0];
	var head2y = y2-head2vector[1];

	d3.select("#passes").style('display','block')
						.append('line')
						.attr('id','pass' + currentpass + 'mainline')
						.attr('x1',x1)
						.attr('y1',y1)
						.attr('x2',x2)
						.attr('y2',y2);

	d3.select("#passes").append('line')
						.attr('id','pass' + currentpass + 'head1line')
						.attr('x1',head1x)
						.attr('y1',head1y)
						.attr('x2',x2)
						.attr('y2',y2);

	d3.select("#passes").append('line')
						.attr('id','pass' + currentpass + 'head2line')
						.attr('x1',head2x)
						.attr('y1',head2y)
						.attr('x2',x2)
						.attr('y2',y2);

	var posleft = x2 + .5*(x1 - x2);
	var postop = y2 + .5*(y1 - y2);
	actionbuttons.style.top = postop + 'px';
	actionbuttons.style.left = posleft + 'px';

	currentpass += 1;
}

function getInitials(name) {
	var currentinitials;

	if (name.includes(" ")) {
		var x = name.split(" ");
		var a = x[0].slice(0,1).toUpperCase();
		var b = x[1].slice(0,1).toUpperCase();
		currentinitials =  a.concat(b);
	}

	else {
		return name.slice(0,1).toUpperCase();
	}

	return currentinitials;
}

function drawNextCircle(player,x,y) {
	d3.select("#circles").append('svg')
						.attr('id','circle' + currentcircle + '')
						.attr('width',circlesvgwidth)
						.attr('height',circlesvgwidth)
						.attr('class','circleforplayers')
						.style('left',x - circleradius)
						.style('top',y - circleradius)
						.style('display','block')
						.append('circle')
						.attr('cx',.5*circlesvgwidth)
						.attr('cy',.5*circlesvgwidth)
						.attr('r',.0231839*window.innerHeight);
	d3.select("#circle" + currentcircle + '').append('text')
						.attr('x','50%')
						.attr('y','65%')
						.attr('text-anchor','middle')
						.style('stroke-width','0')
						.style('fill','#000')
						.style('font-size',.02163833*window.innerHeight)
						.text(getInitials(player));

	d3.select("#circles").style('display','block');

	d3.select("#circle" + currentcircle + '').attr('onmousedown','inputDribble()')
											.attr('onmouseup','stopDribble()');

	d3.select("#circle" + (currentcircle - 1) + '').attr('onmousedown','')
													.attr('onmouseup','');

	currentcircle += 1;
}

///////////////////////////////////////////////////////

var hoopx = .4*window.innerHeight;
var hoopy = .0866*window.innerHeight;

//Scaling Variables
var circleradius = .0247*window.innerHeight;


jss.set('.circleforplayers', {
	'width': '' + .0495*window.innerHeight + 'px',
	'height': '' + .0495*window.innerHeight + 'px',
});

var hoop = document.getElementById('hoop');

//Shot Lines
d3.select("#shots").attr('width',.808124*window.innerHeight)
					.attr('height',.758714*window.innerHeight);

//Pass Lines
d3.select("#passes").attr('width',.808124*window.innerHeight)
					.attr('height',.758714*window.innerHeight);

//Dribble Lines
d3.select("#dribbles").attr('width',.808124*window.innerHeight)
					.attr('height',.758714*window.innerHeight);

//Rebound Lines
d3.select("#rebounds").attr('width',.808124*window.innerHeight)
					.attr('height',.758714*window.innerHeight);

var circlesvgwidth = .049459*window.innerHeight

//Buttons and Divs
var checkbutton = document.getElementById('checkbutton');
var xbutton = document.getElementById('xbutton');
var notrebbutton = document.getElementById('notreb');
var opponentbutton = document.getElementById('opponent');
var oobourbutton = document.getElementById('oobour');
var ooboppbutton = document.getElementById('oobopp')
var pagecontentdiv = document.getElementById('pagecontent');
var actionbuttons = document.getElementById('actionbuttons');

checkbutton.addEventListener("click", chooseAction);
xbutton.addEventListener("click", chooseAction);
notrebbutton.addEventListener("click", notRebounded);
opponentbutton.addEventListener("click", lossTo);
oobourbutton.addEventListener("click", lossTo);
ooboppbutton.addEventListener("click", lossTo);

//Basic Variables
var newevent = {};
var newevent2 = {};

var currentevent;
var currentplayer;
var player1;

var locationtimer = 0;
var locationarray = [];

//State Variables
var abletopass = 0;
var abletoshoot = 0;
var abletodribble = 0;
var abletorebound = 0;

var passwasattempted = 0;
var shotwasattempted = 0;
var reboundwasattempted = 0;

var passoccurred = 0;
var dribbleoccurred = 0;

var currentcircle = 0;
var currentpass = 0;
var currentdribble = 0;
var currentshot = 0;
var currentrebound = 0;

// function undoSequence() {
// 	if (pressure === "Scrimmage") {
// 		if (currentevent !== 0) {
// 			for (var i = 0; i < practicingarray.length; i++) {
// 				var arraylength = maindata["Practices"][indexofpractice]["Data"][i]["ScrimmagePressure"].length
// 				for (var j = 0; j < arraylength; j++) {
// 					if (maindata["Practices"][indexofpractice]["Data"][i]["ScrimmagePressure"][maindata["Practices"][indexofpractice]["Data"][i]["ScrimmagePressure"].length - 1]["Sequence"] === currentsequence) {
// 						maindata["Practices"][indexofpractice]["Data"][i]["ScrimmagePressure"].pop();
// 					}
// 				}
// 			}

// 			d3.select("#shots").selectAll("*").remove();
// 			d3.select("#passes").selectAll("*").remove();
// 			d3.select("#dribbles").selectAll("*").remove();
// 			d3.select("#rebounds").selectAll("*").remove();
// 			d3.select("#circles").selectAll("*").remove();
// 			currentcircle = 0;
// 			currentpass = 0;
// 			currentdribble = 0;
// 			currentshot = 0;
// 			currentrebound = 0;

// 			abletorebound = 0
// 			abletoshoot = 0;
// 			abletodribble = 0;
// 			abletopass = 0;

// 			passwasattempted = 0;
// 			shotwasattempted = 0;
// 			passoccurred = 0;
// 			dribbleoccurred = 0;

// 			newevent = {};
// 			newevent2 = {};

// 			currentevent = 0;
// 			currentplayer = null;

// 			actionbuttons.style.display = "none";
// 			playerdropdowndiv.style.display = "none";

// 			for (var i = 0; i < practicingarray.length; i++) {
// 				var playerid = practicingarray[i].toLowerCase().replace(" ","");
// 				document.getElementById(''+playerid+'').style.display = "block";
// 			}

// 			hoopsvg.setAttribute('onmouseover','');
// 		}

// 		else if (currentevent === 0 && currentsequence !== 0) {
// 			for (var i = 0; i < practicingarray.length; i++) {
// 				var arraylength = maindata["Practices"][indexofpractice]["Data"][i]["ScrimmagePressure"].length
// 				for (var j = 0; j < arraylength; j++) {
// 					if (maindata["Practices"][indexofpractice]["Data"][i]["ScrimmagePressure"][maindata["Practices"][indexofpractice]["Data"][i]["ScrimmagePressure"].length - 1]["Sequence"] === currentsequence - 1) {
// 						maindata["Practices"][indexofpractice]["Data"][i]["ScrimmagePressure"].pop();
// 					}
// 				}
// 			}

// 			d3.select("#shots").selectAll("*").remove();
// 			d3.select("#passes").selectAll("*").remove();
// 			d3.select("#dribbles").selectAll("*").remove();
// 			d3.select("#rebounds").selectAll("*").remove();
// 			d3.select("#circles").selectAll("*").remove();
// 			currentcircle = 0;
// 			currentpass = 0;
// 			currentdribble = 0;
// 			currentshot = 0;
// 			currentrebound = 0;

// 			abletorebound = 0
// 			abletoshoot = 0;
// 			abletodribble = 0;
// 			abletopass = 0;

// 			passwasattempted = 0;
// 			shotwasattempted = 0;
// 			passoccurred = 0;
// 			dribbleoccurred = 0;

// 			newevent = {};
// 			newevent2 = {};

// 			currentevent = 0;
// 			currentsequence -= 1;
// 			currentplayer = null;

// 			actionbuttons.style.display = "none";
// 			playerdropdowndiv.style.display = "none";

// 			for (var i = 0; i < practicingarray.length; i++) {
// 				var playerid = practicingarray[i].toLowerCase().replace(" ","");
// 				document.getElementById(''+playerid+'').style.display = "block";
// 			}

// 			hoopsvg.setAttribute('onmouseover','');
// 		}
// 	}
// }