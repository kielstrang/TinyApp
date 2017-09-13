var express = require("express");
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');

var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

let urlDatabase = {
  "b2xVn2": {
    short: "b2xVn2",
    long: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    short: "9sm5xK",
    long: "http://www.google.com",
    userID: "userRandomID2"
  }
};

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

function userOwnsURL(userID, urlID) {
  const url = urlDatabase[urlID];
  return url.userID === userID;
}

function getUserURLs(userID) {
  const urls = {};
  for (shortURL in urlDatabase) {
    if (userOwnsURL(userID, shortURL)) {
      urls[shortURL] = urlDatabase[shortURL];
    }
  }
  return urls;
}

function checkLogin (request, response, next) {
  const userID = response.locals.user.id;
  if(userID !== undefined && userID in users) {
    next();
  } else {
    response.redirect('/login');
  }
}

function checkURLExists (request, response, next) {
  const shortURL = request.params.id;
  if (shortURL in urlDatabase) {
    next();
  } else {
    response.status(404);
    response.redirect('/urls/notfound');
  }
}

function checkUserOwnsURL (request, response, next) {
  const shortURL = request.params.id;
  const userID = response.locals.user.id;
  const ownerID = urlDatabase[shortURL].userID;
  if (userID === ownerID) {
    next();
  } else {
    response.status(401);
    response.send("You don't own this URL.");
  }
}

//Get list of URLs
app.get("/urls", (request, response) => {
  response.locals.urls = getUserURLs(response.locals.user);
  response.render("urls_index");
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
  const url = urlDatabase[request.params.id];
  response.render("urls_show", { url: url });
});

//Short URL redirects to long URL
app.get("/u/:id", checkURLExists, (request, response) => {
  const shortURL = request.params.id;
  const longURL = urlDatabase[shortURL].long;
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
  const shortURL = generateRandomString(6);
  const longURL = request.body.longURL;
  urlDatabase[shortURL] = {
    short: shortURL,
    long: longURL,
    userID: response.locals.user
  };
  response.redirect(`/urls/${shortURL}`);
});

//Delete URL
app.post("/urls/:id/delete", checkLogin, checkURLExists, checkUserOwnsURL, (request, response) => {
  const shortURL = request.params.id;
  delete urlDatabase[shortURL];
  response.redirect('/urls');
});

//Edit URL
app.post("/urls/:id", checkLogin, checkURLExists, checkUserOwnsURL, (request, response) => {
  const shortURL = request.params.id;
  const longURL = request.body.longURL;

  urlDatabase[shortURL] = {
    short: shortURL,
    long: longURL,
    userID: response.locals.user
  };
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
  if (getUserByEmail(email) !== undefined) {
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