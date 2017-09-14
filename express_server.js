const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const urldb = require("./url-database");

const app = express();
const PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

let users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "correct-horse-battery-staple"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "plaintext-passwords-are-fun"
  }
};

//get login cookie
app.use(function (request, response, next) {
  response.locals = {
    user: users[request.cookies['user_id']]
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

function getUserByEmail(email) {
  for (const id in users) {
    if (users[id].email === email) {
      return users[id];
    }
  }
  return undefined;
}

function checkLogin (request, response, next) {
  const user = response.locals.user;
  if(user && user.id in users) {
    next();
  } else {
    response.redirect('/login');
  }
}

function checkURLExists (request, response, next) {
  const shortURL = request.params.id;
  if (shortURL in urldb.getAllURLs()) {
    next();
  } else {
    response.status(404);
    response.redirect('/urls/notfound');
  }
}

function checkUserOwnsURL (request, response, next) {
  if (urldb.userOwnsURL(response.locals.user, request.params.id)) {
    next();
  } else {
    response.status(401);
    response.send("You don't own this URL.");
  }
}

//Get list of URLs
app.get("/urls", (request, response) => {
  const userURLs = urldb.getUserURLs(response.locals.user);
  response.render("urls_index", { userURLs: userURLs});
});

//Get form for new short URL
app.get("/urls/new", checkLogin, (request, response) => {
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
  const longURL = getAllURLs(shortURL).long;
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
app.post("/urls", checkLogin, (request, response) => {
  const newShortURL = generateRandomString(6);
  urldb.saveURL(newShortURL, request.body.longURL, response.locals.user.id);
  response.redirect(`/urls/${newShortURL}`);
});

//Delete URL
app.post("/urls/:id/delete", checkLogin, checkURLExists, checkUserOwnsURL, (request, response) => {
  urldb.deleteURL(request.params.id);
  response.redirect('/urls');
});

//Edit URL
app.post("/urls/:id", checkLogin, checkURLExists, checkUserOwnsURL, (request, response) => {
  urldb.saveURL(request.params.id, request.body.longURL, response.locals.user.id);
  response.redirect('/urls');
});

//Register user
app.post("/register", (request, response) => {
  const userID = generateRandomString(8);
  const { email, password } = request.body;

  //Guard for missing email or password
  if (email === '' || password ==='') {
    response.status(400);
    response.send("Please specify an email and password");
    return;
  }
  
  //Guard for already registered email
  if (getUserByEmail(email)) {
    response.status(400);
    response.send("This email is already registered");
    return;
  }

  //Register the user
  users[userID] = {
    id: userID,
    email: email,
    password: password
  };
  response.cookie('user_id', userID);
  response.redirect('/urls');
});

//Log in
app.post("/login", (request, response) => {
  const { email, password } = request.body;
  const user = getUserByEmail(email);

  if(user && user.password === password) {
    response.cookie('user_id', user.id);
    response.redirect('/');
  } else {
    response.status(401);
    response.send("Incorrect email or password");
  }
});

//Log out
app.post("/logout", (request, response) => {
  response.clearCookie('user_id');
  response.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});