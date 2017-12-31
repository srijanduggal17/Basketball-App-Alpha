var currentUser;
var credential;

document.getElementById("editname").addEventListener("click", editname);
document.getElementById('editemail').addEventListener("click", editemail);
document.getElementById("updatepassword").addEventListener("click", updatepassword);
document.getElementById("verification").addEventListener("click", verification);
document.getElementById("deleteaccount").addEventListener("click", deleteaccount);

var accountname = document.getElementById("accountname");
var accountemail = document.getElementById("accountemail");
var verificationdiv = document.getElementById("verificationdiv");
var verificationbutton = document.getElementById("verification");
var deleteaccount = document.getElementById("deleteaccount");

firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		//User is signed in
		currentUser = user;
		accountname.innerHTML = currentUser.displayName;
		accountemail.innerHTML = currentUser.email;
	}
	else {
		//No user is signed in
		console.log("user is not signed in");
		window.location.href = "../HTML/sign_in_up.html";
	}
});

function editname() {
	accountname.innerHTML = "";
	var nameinput = document.createElement("input");
	nameinput.type = "text";
	nameinput.id ="newname";
	nameinput.value = currentUser.displayName;
	accountname.appendChild(nameinput);

	var aster = document.createElement("span");
	aster.id = "nameaster";
	aster.classList.add("aster");
	aster.innerHTML = "*";
	accountname.appendChild(aster);
}

function editemail() {
	//reauthenticate();
	accountemail.innerHTML = "";
	var emailinput = document.createElement("input");
	emailinput.type = "text";
	emailinput.id ="newemail";
	emailinput.value = currentUser.email;
	accountemail.appendChild(emailinput);

	var aster = document.createElement("span");
	aster.id = "nameaster";
	aster.classList.add("aster");
	aster.innerHTML = "*";
	accountemail.appendChild(aster);
}

function updatepassword() {
	//reauthenticate();
}

function verification() {

	currentUser.sendEmailVerification().then(function() {
  		// Email sent.
  		console.log("Email sent");
  		var verificationdisplay = document.createElement("p");
  		verificationdisplay.innerHTML = "Verification email sent!";
  		verificationdiv.removeChild(verificationbutton);
  		verificationdiv.appendChild(verificationdisplay);

	}).catch(function(error) {
  		// An error happened.
  		console.error("Verification email not sent");
		console.log(error.message);
		console.log("Error code: " + error.code);
	});
}

/*function deleteaccount() {
	currentUser.delete().then(function(delete){
		// User deleted

	}).catch(function(error){
		// An error happened.

	});
}*/

/*function reauthenticate() {
	var password = prompt("Please reenter your password:","");

	var cred = firebase.auth.EmailAuthProvider.credential(user.email,password);

	currentUser.reauthenticateWithCredential(cred).then(function() {
  		// User re-authenticated.
  		console.log("User re-authenticated!")
	}).catch(function(error) {
  		// An error happened.
  		console.error("User re-authentication failed!");
		console.log(error.message);
		console.log("Error code: " + error.code);
	});
}*/
