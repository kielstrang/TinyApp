const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const urldb = require("./url-database");
const userdb = require("./user-database");

const app = express();
const PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//get login cookie
app.use(function (request, response, next) {
  response.locals = {
    user: userdb.getUser(request.cookies['user_id'])
  };
  next();
});

function generateRandomString(strLength) {
  let str = "";
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < strLength; i++) {
    str += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return str;
}



function isAuthenticated (request, response, next) {
  const user = response.locals.user;
  if(user && user.id in userdb.getAllUsers()) return next();
  response.redirect('/login');
}

function checkURLExists (request, response, next) {
  const shortURL = request.params.id;
  if (shortURL in urldb.getAllURLs()) return next();
  response.status(404);
  response.redirect('/urls/notfound');
}

function checkUserOwnsURL (request, response, next) {
  if (urldb.userOwnsURL(response.locals.user, request.params.id)) return next();
  response.status(401);
  response.send("You don't own this URL.");
}

function checkValidEmailPassword (request, response, next) {
  const { email, password } = request.body;
  if (email && password) return next();
  response.status(400);
  response.send("Please specify an email and password");
}

function checkEmailAvailable (request, response, next) {
  if (!userdb.getUserByEmail(request.body.email)) return next();
  response.status(400);
  response.send("This email is already registered");
}

function checkValidLogin (request, response, next) {
  const { email, password } = request.body;
  const user = userdb.getUserByEmail(email);

  if(user && user.password === password) return next();
  response.status(401);
  response.send("Incorrect email or password");
}

//Root redirects to urls or login
app.get("/", (request, response) => {
  if(response.locals.user) {
    response.redirect("/urls");
  } else {
    response.redirect("/login");
  }
});

//Get list of URLs
app.get("/urls", (request, response) => {
  const userURLs = urldb.getUserURLs(response.locals.user);
  response.render("urls_index", { userURLs: userURLs});
});

//Get form for new short URL
app.get("/urls/new", isAuthenticated, (request, response) => {
  response.render("urls_new");
});

//URL not found page
app.get("/urls/notfound", (request, response) => {
  response.render("urls_notfound");
});

//Show single shortened URL
app.get("/urls/:id", checkURLExists, (request, response) => {
  const url = urldb.getURL(request.params.id);
  const auth = urldb.userOwnsURL(response.locals.user, url.short);
  response.render("urls_show", { url: url, auth: auth });
});

//Short URL redirects to long URL
app.get("/u/:id", checkURLExists, (request, response) => {
  const shortURL = request.params.id;
  const longURL = urldb.getURL(shortURL).long;
  console.log('Redirecting to ' + longURL);
  response.redirect(longURL);
});

//Get login page
app.get("/login", (request, response) => {
  response.render("login");
});

//Get registration page
app.get("/register", (request, response) => {
  response.render("register");
});

//Add new short URL
app.post("/urls", isAuthenticated, (request, response) => {
  const newShortURL = generateRandomString(6);
  urldb.saveURL(newShortURL, request.body.longURL, response.locals.user.id);
  response.redirect(`/urls/${newShortURL}`);
});

//Delete URL
app.post("/urls/:id/delete", isAuthenticated, checkURLExists, checkUserOwnsURL, (request, response) => {
  urldb.deleteURL(request.params.id);
  response.redirect('/urls');
});

//Edit URL
app.post("/urls/:id", isAuthenticated, checkURLExists, checkUserOwnsURL, (request, response) => {
  urldb.saveURL(request.params.id, request.body.longURL, response.locals.user.id);
  response.redirect('/urls');
});

//Register user
app.post("/register", checkValidEmailPassword, checkEmailAvailable, (request, response) => {
  const userID = generateRandomString(8);
  const { email, password } = request.body;
  userdb.saveUser(userID, email, password);
  response.cookie('user_id', userID);
  response.redirect('/urls');
});

//Log in
app.post("/login", checkValidLogin, (request, response) => {
  const user = userdb.getUserByEmail(request.body.email);
  response.cookie('user_id', user.id);
  response.redirect('/');
});

//Log out
app.post("/logout", (request, response) => {
  response.clearCookie('user_id');
  response.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});