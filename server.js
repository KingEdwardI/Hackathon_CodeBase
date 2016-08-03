
// $ npm init

// $ npm install --save express

var express = require("express");

var app = express();

var PORT = process.env.port || 8000;

// if we want to handle post requests

// $ npm install --save body-parser

var bodyParser = require("body-parser");

var session = require('express-session');

var mongoose = require("mongoose");

mongoose.connect('mongodb://localhost');

var UserFtns = require("./UserFtns.js");

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// if we want to handle session (login, etc)

// $ npm install --save express-session

app.use(session({
	secret: "Secret Key",
	resave: false,
	saveUninitialized: false
}));

//do this for every request
app.use(function(req, res, next) {
	console.log(req.url);
	next();
});

// if we want to respond to GET requests for "/"
app.get("/", function(req, res) {
	res.sendFile(__dirname + "/index.html");
});

// if we want to respond to POST requests for "/api"
app.post("/api", function(req, res) {
	res.send("success");
});
app.get('/login', function(req, res){
	res.sendFile(__dirname + "/public/login.html");
});

app.post('/login', function(req, res){
	if (UserFtns.checkLogin(req.body.username, req.body.password))
	{
		req.session.user = req.body.username;
		res.send("success");
	}else {
		res.send("error");
	}
});

app.get('/logout', function(req,res){
	req.session.user = "";
	res.redirect("/index.html");
});

app.get('/new_page(.html)?', function(req,res) {
	if (!req.session.user) {
		res.redirect("/login");
		return;
	}
	res.sendFile(__dirname + "/public/new_page.html");
});

app.post('/register', function(req, res){
	//shorthand variables to save us time
	var username = req.body.username;
	var password = req.body.password;
	if (UserFtns.userExists(username)) {
		// If the username already exists
		if (UserFtns.checkLogin(username, password)) {
			// ... and they have the right password
			// then log the user in
			req.session.user = username;
			// Send "success" so that the frontend knows
			// it is ok to redirect to /map
			res.send("success");
		} else {
			// Otherwise, they might be trying to
			// take a username that already exists - error!
			res.send("error");
		}
	} else {
		// Username is not taken, register a new user
		// and log them in - success!
		if(UserFtns.registerUser(username, password)) {
			req.session.user = username;
			// Send "success" so that the frontend knows
			// it is ok to redirect to /map
			res.send("success");
		} else {
			// there was a problem registering
			res.send("error");
		}
	}
});
// if we want to serve static files out of ./public
app.use(express.static("public"));

// actually start the server
app.listen(PORT, function() {
	console.log("Listening on port " + PORT);
});