const eventtype = localStorage.currentevent.split(",")[0].toLowerCase() + "s";
const eventkey = localStorage.currentevent.split(",")[1];

var piechartcounter = {};
var totals = {};
var gendataset = [];
var specdataset = [];
var bardata = {
	"Shot Made" : {},
	"Shot Missed" : {},
	"Pass Made" : {},
	"Pass Missed" : {},
	"Dribble" : {},
	"Dribble Stolen" : {},
	"Shot Attempts" : {},
	"Pass Attempts" : {},
	"Dribble Attempts" : {}
};
var rawstuff;

const playerlist = {};

var winwidth = window.innerWidth;

firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		//User is signed in
		currentUser = user;
		database.ref('/teamslist/' + localStorage.currentteam + '/players/').once("value", function(list) {
			for (const plyr in list.val()) {
				playerlist[plyr] = list.val()[plyr]["Name"];
			}
			console.log(playerlist);

			database.ref('/teamslist/' + localStorage.currentteam + '/' + eventtype + '/' + eventkey + '/Data').once("value", function (dat) {
				for (const player in dat.val()) {
					piechartcounter[player] = {};
					piechartcounter[player]["Shot Made"] = 0;
					piechartcounter[player]["Shot Missed"] = 0;
					piechartcounter[player]["Pass Made"] = 0;
					piechartcounter[player]["Pass Missed"] = 0;
					piechartcounter[player]["Pass Received"] = 0;
					piechartcounter[player]["Pass Not Received"] = 0;
					piechartcounter[player]["Dribble"] = 0;
					piechartcounter[player]["Dribble Stolen"] = 0;

					for (const obj in dat.val()[player]["GamePressure"]) {
						piechartcounter[player][dat.val()[player]["GamePressure"][obj]["Action"]] += 1;
					}
				}

				createDataset();
				pieChart();
				setupBar();
			}, function (error) {
				console.error("First Half Data not retrieved");
				console.log(error.message);
				console.log("Error code: " + error.code);
			});
		}, function (error) {
			console.error("Player list not retrieved");
			console.log(error.message);
			console.log("Error code: " + error.code);
		});
		console.log("user signed in");
		console.log(currentUser.uid);
	}
	else {
		//No user is signed in
		console.log("user is not signed in");
		window.location.href = "../HTML/sign_in_up.html";
	}
});

function createDataset() {
	totals["Shot Made"] = 0;
	totals["Shot Missed"] = 0;
	totals["Pass Made"] = 0;
	totals["Pass Missed"] = 0;
	totals["Pass Received"] = 0;
	totals["Pass Not Received"] = 0;
	totals["Dribble"] = 0;
	totals["Dribble Stolen"] = 0;

	bardata["Shot Made"] = [];
	bardata["Shot Missed"] = [];
	bardata["Pass Made"] = [];
	bardata["Pass Missed"] = [];
	bardata["Dribble"] = [];
	bardata["Dribble Stolen"] = [];

	bardata["Shot Attempts"] = [];
	bardata["Pass Attempts"] = [];
	bardata["Dribble Attempts"] = [];

	for (const player in piechartcounter) {
		totals["Shot Made"] += piechartcounter[player]["Shot Made"];
		totals["Shot Missed"] += piechartcounter[player]["Shot Missed"];
		totals["Pass Made"] += piechartcounter[player]["Pass Made"];
		totals["Pass Missed"] += piechartcounter[player]["Pass Missed"];
		totals["Dribble"] += piechartcounter[player]["Dribble"];
		totals["Dribble Stolen"] += piechartcounter[player]["Dribble Stolen"];

		// bardata["Shot Made"][player] = piechartcounter[player]["Shot Made"];
		// bardata["Shot Missed"][player] = piechartcounter[player]["Shot Missed"];
		// bardata["Pass Made"][player] = piechartcounter[player]["Pass Made"];
		// bardata["Pass Missed"][player] = piechartcounter[player]["Pass Missed"];
		// bardata["Dribble"][player] = piechartcounter[player]["Dribble"];
		// bardata["Dribble Stolen"][player] = piechartcounter[player]["Dribble Stolen"];

		// bardata["Shot Attempts"][player] = bardata["Shot Made"][player] + bardata["Shot Missed"][player];
		// bardata["Pass Attempts"][player] = bardata["Pass Made"][player] + bardata["Pass Missed"][player];
		// bardata["Dribble Attempts"][player] = bardata["Dribble"][player] + bardata["Dribble Stolen"][player];

		bardata["Shot Made"].push({
			"player" : player,
			"value" : piechartcounter[player]["Shot Made"]
		});
		bardata["Shot Missed"].push({
			"player" : player,
			"value" : piechartcounter[player]["Shot Missed"]
		});
		bardata["Pass Made"].push({
			"player" : player,
			"value" : piechartcounter[player]["Pass Made"]
		});
		bardata["Pass Missed"].push({
			"player" : player,
			"value" : piechartcounter[player]["Pass Missed"]
		});
		bardata["Dribble"].push({
			"player" : player,
			"value" : piechartcounter[player]["Dribble"]
		});
		bardata["Dribble Stolen"].push({
			"player" : player,
			"value" : piechartcounter[player]["Dribble Stolen"]
		});
		bardata["Shot Attempts"].push({
			"player" : player,
			"value" : piechartcounter[player]["Shot Made"] + piechartcounter[player]["Shot Missed"]
		});
		bardata["Pass Attempts"].push({
			"player" : player,
			"value" : piechartcounter[player]["Pass Made"] + piechartcounter[player]["Pass Missed"]
		});
		bardata["Dribble Attempts"].push({
			"player" : player,
			"value" : piechartcounter[player]["Dribble"] + piechartcounter[player]["Dribble Stolen"]
		});
	}

	totals["Shot Attempts"] = totals["Shot Made"] + totals["Shot Missed"];
	totals["Pass Attempts"] = totals["Pass Made"] + totals["Pass Missed"];
	totals["Dribble Attempts"] = totals["Dribble"] + totals["Dribble Stolen"];

	gendataset = [{value: totals["Shot Attempts"], label: "Shots"}, {value: totals["Pass Attempts"], label: "Passes"}, {value: totals["Dribble Attempts"], label: "Dribbles"}];
	specdataset = [{value: totals["Shot Made"], label: "Shots Made"}, {value: totals["Shot Missed"], label: "Shots Missed"}, {value: totals["Pass Made"], label: "Passes Made"}, {value: totals["Pass Missed"], label: "Passes Missed"}, {value: totals["Dribble"], label: "Dribbles"}, {value: totals["Dribble Stolen"], label: "Dribbles Stolen"}]
}

function pieChart() {
	d3.select("#piechart1div")
		.attr("width","500px")
		.attr("height","500px")
		.attr("position","relative");

	d3.select("#piechart2div")
		.attr("width","500px")
		.attr("height","500px")
		.attr("position","relative");

	var w = 800;
	var h = 500;

	var outerRadius = h / 3;
	var innerRadius = 65;

	var arc = d3.arc()
		.innerRadius(innerRadius)
		.outerRadius(outerRadius);

	var pie = d3.pie()
		.value(function(d) {
			return d.value;
		})
		.sort(null);

	var color =  d3.scaleOrdinal(["rgb(31, 119, 180)", "rgb(255, 127, 14)", "rgb(44, 160, 44)"]);
	var color2 = d3.scaleOrdinal([ "rgb(31, 119, 180)", "rgb(158, 202, 225)", "rgb(230, 85, 13)", "rgb(253, 141, 60)", "rgb(253, 174, 107)", "rgb(253, 208, 162)", "rgb(49, 163, 84)"]);

	//Create SVG element
	var svg = d3.select("#piechart1div")
		.append("svg")
		.attr("width", w)
		.attr("height", h)
		.attr("id", "piechart1");

	var svg2 = d3.select("#piechart2div")
		.append("svg")
		.attr("width", w)
		.attr("height", h)
		.attr("id", "piechart2");

	//Set up groups
	var arcs = svg.selectAll("g.arc")
		.data(pie(gendataset))
		.enter()
		.append("g")
		.attr("class", "arc")
		.attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

	var arcs2 = svg2.selectAll("g.arc")
		.data(pie(specdataset))
		.enter()
		.append("g")
		.attr("class", "arc")
		.attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

	//Draw arc paths
	
	arcs.append("path")
		.attr("fill", function(d, i) {
			return color(i);
		})
		.attr("d", arc);

	arcs2.append("path")
		.attr("fill", function(d, i) {
			return color2(i);
		})
		.attr("d", arc);

	//Labels
	arcs.append("text")
		.attr("transform", function(d) {
			return "translate(" + arc.centroid(d) + ")";
		})
		.attr("text-anchor", "middle")
		.text(function(d) {
			if (d.value == 0) {
				return "";
			}
			else {
				return d.value;
			}
		});

	arcs2.append("text")
		.attr("transform", function(d) {
			return "translate(" + arc.centroid(d) + ")";
		})
		.attr("text-anchor", "middle")
		.text(function(d) {
			if (d.value == 0) {
				return "";
			}
			else {
				return d.value;
			}
		});

	var ordinal = d3.scaleOrdinal()
		.domain(["Shots", "Passes", "Dribbles"])
		.range([ "rgb(31, 119, 180)", "rgb(255, 127, 14)", "rgb(44, 160, 44)"]);

	var svg = d3.select("svg");

	svg.append("g")
		.attr("class", "legendOrdinal")
		.attr("transform", "translate(400,20)");

	var legendOrdinal = d3.legendColor()
		.shape("path", d3.symbol().type(d3.symbolCircle).size(150)())
		.shapePadding(10)
		.scale(ordinal);

	svg.select(".legendOrdinal")
		.call(legendOrdinal);

	
	var ordinal2 = d3.scaleOrdinal()
		.domain(["Shots Made", "Shots Missed", "Passes Made", "Passes Missed", "Dribbles", "Dribbles Stolen"])
		.range([ "rgb(31, 119, 180)", "rgb(158, 202, 225)", "rgb(230, 85, 13)", "rgb(253, 141, 60)", "rgb(253, 174, 107)", "rgb(253, 208, 162)", "rgb(49, 163, 84)"]);

	var svg2 = d3.select("#piechart2");

	svg2.append("g")
		.attr("class", "legendOrdinal")
		.attr("transform", "translate(400,20)");

	var legendOrdinal2 = d3.legendColor()
		.shape("path", d3.symbol().type(d3.symbolCircle).size(150)())
		.shapePadding(10)
		.scale(ordinal2);

	svg2.select(".legendOrdinal")
		.call(legendOrdinal2);


	var tooltip = d3.select('#piechart1div')
		.append('div')
		.attr('class', 'tooltip')
		.attr('id','tooltip');

	tooltip.append('div')
		.attr('class', 'label');

	tooltip.append('div')
		.attr('class', 'count');

	tooltip.append('div')
		.attr('class', 'percent');


	var tooltip2 = d3.select('#piechart2div')
		.append('div')
		.attr('class', 'tooltip2')
		.attr('id','tooltip2');

	tooltip2.append('div')
		.attr('class', 'label');

	tooltip2.append('div')
		.attr('class', 'count');

	tooltip2.append('div')
		.attr('class', 'percent'); 


	arcs.on('mouseover', function (d) {
		var total = d3.sum(gendataset.map(function(d) {
			return d.value;
		}));
		var percent = Math.round(1000 * d.data.value / total) / 10;
		tooltip.select('.label').html(d.data.label);
		tooltip.select('.count').html(d.data.value + " out of " + total + " total actions");
		tooltip.select('.percent').html(percent + '%');
		tooltip.style('display', 'block');
		tooltip.style('left', "" + .1*winwidth + "px");
		tooltip.style('top', "" + .11*winwidth + "px");
		tooltip.style('width', "" + .12*winwidth + "px");
	});

	arcs.on('mouseout', function(d){
		tooltip.style('display', 'none');
	});

	arcs.on('click', function(d){
		switch(d.data.label) {
			case "Shots":
				console.log("shots");
				update(bardata["Shot Attempts"]);
				changeTitle('chart1', 'Shot Attempts');
				break;
			case "Passes":
				console.log("passes");
				update(bardata["Pass Attempts"]);
				changeTitle('chart1', 'Pass Attempts');
				break;
			case "Dribbles":
				console.log("dribbles");
				update(bardata["Dribble Attempts"]);
				changeTitle('chart1', 'Dribble Attempts');
				break;
		}
	});

	arcs2.on('mouseover', function (d) {
		var total = d3.sum(specdataset.map(function(d) {
		  return d.value;
		}));
		var percent = Math.round(1000 * d.data.value / total) / 10;
		tooltip2.select('.label').html(d.data.label);
		tooltip2.select('.count').html(d.data.value + " out of " + total + " total actions");
		tooltip2.select('.percent').html(percent + '%');
		tooltip2.style('display', 'block');
		tooltip2.style('left', "" + .1*winwidth + "px");
		tooltip2.style('top', "" + .11*winwidth + "px");
		tooltip2.style('width', "" + .12*winwidth + "px");

	});

	arcs2.on('mouseout', function(d){
		tooltip2.style('display', 'none');
	});

	arcs2.on('click', function(d){
		switch(d.data.label) {
			case "Shots Made":
				update2(bardata["Shot Made"]);
				changeTitle('chart2', 'Shots Made');
				break;
			case "Shots Missed":
				update2(bardata["Shot Missed"]);
				changeTitle('chart2', 'Shots Missed');
				break;
			case "Passes Made":
				update2(bardata["Pass Made"]);
				changeTitle('chart2', 'Passes Made');
				break;
			case "Passes Missed":
				update2(bardata["Pass Missed"]);
				changeTitle('chart2', 'Passes Missed');
				break;
			case "Dribbles":
				update2(bardata["Dribble"]);
				changeTitle('chart2', 'Dribbles Completed');
				break;
			case "Dribbles Stolen":
				update2(bardata["Dribble Stolen"]);
				changeTitle('chart2', 'Dribbles Stolen');
				break;
		}
	});
}

var margin;
var width;
var height;
var chart;
var xChart;
var yChart;
var xAxis;
var yAxis;

var margin2;
var width2;
var height2;
var chart2;
var xChart2;
var yChart2;
var xAxis2;
var yAxis2;

function setupBar() {
	//set up chart
	margin = {top: 20, right: 20, bottom: 95, left: 50};
	width = 400;
	height = 250;

	chart = d3.select(".chart1")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	xChart = d3.scaleBand()
		.range([0, width]);

	yChart = d3.scaleLinear()
		.range([height, 0]);

	xAxis = d3.axisBottom(xChart)
		.tickSizeOuter(0);
	yAxis = d3.axisLeft(yChart)
		.tickSizeOuter(0)
		.ticks(0);

	//set up axes
	//left axis
	chart.append("g")
		.attr("class", "y axis")
		.call(yAxis)

		//bottom axis
		chart.append("g")
			.attr("class", "xAxis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
			.selectAll("text")
			.style("text-anchor", "end")
			.attr("dx", "-.8em")
			.attr("dy", ".15em")
			.attr("transform", function(d){
				return "rotate(-65)";
			});

	chart
		.append("text")
		.attr("transform", "translate(" + (width/2) + "," + (height + margin.bottom - 5) + ")")
		.text("Player");

	chart
		.append("text")
		.attr("transform", "translate(" + (width/2) + "," + (0 - (margin.top /2)) + ")")
		.attr("id", "chart1")
		.style("font-size", "14px") 
  // 	chart
  // 		.append("text")
		// .attr("transform", "translate(-" + (margin.left) + "," + (height/2) + ")")
		// .attr("transform", "rotate(-90)")
 	 //   	.text("Value");

	//set up chart
	margin2 = {top: 20, right: 20, bottom: 95, left: 50};
	width2 = 400;
	height2 = 250;

	chart2 = d3.select(".chart2")
		.attr("width", width2 + margin2.left + margin2.right)
		.attr("height", height2 + margin2.top + margin2.bottom)
		.append("g")
		.attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

	xChart2 = d3.scaleBand()
		.range([0, width2]);

	yChart2 = d3.scaleLinear()
		.range([height2, 0]);

	xAxis2 = d3.axisBottom(xChart2)
		.tickSizeOuter(0);
	yAxis2 = d3.axisLeft(yChart2)
		.tickSizeOuter(0)
		.ticks(0);

	//set up axes
	//left axis
	chart2.append("g")
		.attr("class", "y axis")
		.call(yAxis2)

		//bottom axis
		chart2.append("g")
			.attr("class", "xAxis")
			.attr("transform", "translate(0," + height2 + ")")
			.call(xAxis2)
			.selectAll("text")
			.style("text-anchor", "end")
			.attr("dx", "-.8em")
			.attr("dy", ".15em")
			.attr("transform", function(d){
				return "rotate(-65)";
			});

	chart2
		.append("text")
		.attr("transform", "translate(" + (width2/2) + "," + (height2 + margin2.bottom - 5) + ")")
		.text("Player");

	chart2
		.append("text")
		.attr("transform", "translate(" + (width2/2) + "," + (0 - (margin2.top /2)) + ")")
		.attr("id", "chart2")
        .style("font-size", "14px") 
  // 	chart
  // 		.append("text")
		// .attr("transform", "translate(-" + (margin.left) + "," + (height/2) + ")")
		// .attr("transform", "rotate(-90)")
  //   	.text("Value");
}

function update(data){
	let rawstuff = [];
	for (let i = 0; i < data.length; i++) {
		if (data[i]["value"] !== 0) {
			rawstuff[rawstuff.length] = Object.assign({}, data[i]);
			rawstuff[rawstuff.length - 1]["player"] = playerlist[rawstuff[rawstuff.length - 1]["player"]];
		}
	}

	//set domain for the x axis
	xChart.domain(rawstuff.map(function(d){ return d.player; }) );
	//set domain for y axis
	yChart.domain( [0, d3.max(rawstuff, function(d){ return d.value; })] );
	yAxis.ticks(d3.max(rawstuff, function(d){ return d.value; }));
	//get the width of each bar 
	var barWidth = width / rawstuff.length;
	
	//select all bars on the graph, take them out, and exit the previous data set. 
	//then you can add/enter the new data set
	var bars = chart.selectAll(".bar")
		.remove()
		.exit()
		.data(rawstuff)
	//now actually give each rectangle the corresponding data
	bars.enter()
		.append("rect")
		.attr("class", "bar")
		.attr("x", function(d, i){ return i * barWidth + 1})
		.attr("y", function(d){ return yChart(d.value); })
		.attr("height", function(d){ return height - yChart(d.value); })
		.attr("width", barWidth - 1)
		.attr("fill", function(d){ 
			return "rgb(251,180,174)";
		});

	//left axis
	chart.select('.y')
		.call(yAxis)
	//bottom axis
	chart.select('.xAxis')
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis)
		.selectAll("text")
		.style("text-anchor", "end")
		.attr("dx", "-.8em")
		.attr("dy", ".15em")
		.attr("transform", function(d){
			return "rotate(-65)";
		});
}

function update2(data){
	console.log(data);
	let rawstuff = [];
	for (let i = 0; i < data.length; i++) {
		if (data[i]["value"] !== 0) {
			rawstuff[rawstuff.length] = Object.assign({}, data[i]);
			rawstuff[rawstuff.length - 1]["player"] = playerlist[rawstuff[rawstuff.length - 1]["player"]];
		}
	}

	//set domain for the x axis
	xChart2.domain(rawstuff.map(function(d){ return d.player; }) );
	//set domain for y axis
	yChart2.domain( [0, d3.max(rawstuff, function(d){ return d.value; })] );
	yAxis2.ticks(d3.max(rawstuff, function(d){ return d.value; }));
	//get the width of each bar 
	var barWidth2 = width2 / rawstuff.length;
	
	//select all bars on the graph, take them out, and exit the previous data set. 
	//then you can add/enter the new data set
	var bars2 = chart2.selectAll(".bar")
		.remove()
		.exit()
		.data(rawstuff)
	//now actually give each rectangle the corresponding data
	bars2.enter()
		.append("rect")
		.attr("class", "bar")
		.attr("x", function(d, i){ return i * barWidth2 + 1})
		.attr("y", function(d){ return yChart2(d.value); })
		.attr("height", function(d){ return height2 - yChart2(d.value); })
		.attr("width", barWidth2 - 1)
		.attr("fill", function(d){ 
			return "rgb(251,180,174)";
		});

	//left axis
	chart2.select('.y')
		.call(yAxis2)
	//bottom axis
	chart2.select('.xAxis')
		.attr("transform", "translate(0," + height2 + ")")
		.call(xAxis2)
		.selectAll("text")
		.style("text-anchor", "end")
		.attr("dx", "-.8em")
		.attr("dy", ".15em")
		.attr("transform", function(d){
			return "rotate(-65)";
		});
}

function changeTitle(chart, newtitle) {
	d3.select("#" + chart)
		.text(newtitle);
}