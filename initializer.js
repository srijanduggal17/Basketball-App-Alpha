// Initialize Firebase
var config = {
	apiKey: "AIzaSyDsxvLwn0Sg1L7IAWP11bKYFnBUR3s3b0Q",
	authDomain: "fir-demo-2f70b.firebaseapp.com",
	databaseURL: "https://fir-demo-2f70b.firebaseio.com",
	projectId: "fir-demo-2f70b",
	storageBucket: "",
	messagingSenderId: "923842078810"
};
firebase.initializeApp(config);

window.nodeRequire = require;
delete window.require;
delete window.exports;
delete window.module;

//Create reference to database
var database = firebase.database();