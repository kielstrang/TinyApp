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

//pass login cookie and urlDatabase to templates using local variables
app.use(function (request, response, next) {
  response.locals = {
    user: users[request.cookies['user_id']],
    urlDatabase: urlDatabase,
    users: users
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
  const userID = response.locals.user.id;
  console.log(userID);
  console.log(users);
  if(userID !== undefined && userID in users) {
    next();
  } else {
    response.redirect('/login');
  }
}

function checkURLExists (request, response, next) {
  const shortURL = request.params.id;
  if (shortURL in response.locals.urlDatabase) {
    next();
  } else {
    response.redirect('/urls/notfound');
  }
}

function checkUserOwnsURL (request, response, next) {
  next();
}

app.get("/urls", (request, response) => {
  response.render("urls_index");
});

app.get("/urls/new", checkLogin, (request, response) => {
  response.render("urls_new");
});

app.get("/urls/notfound", (request, response) => {
  response.render("urls_notfound");
});

app.get("/urls/:id", checkURLExists, (request, response) => {
  const url = urlDatabase[request.params.id];
  response.render("urls_show", { url: url });
});

app.get("/u/:id", checkURLExists, (request, response) => {
  const shortURL = request.params.id;
  const longURL = urlDatabase[shortURL].long;
  response.redirect(longURL);
});

app.get("/login", (request, response) => {
  response.render("login");
});

app.get("/register", (request, response) => {
  response.render("register");
});

app.post("/urls", (request, response) => {
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

app.post("/login", (request, response) => {
  const { email, password } = request.body;
  const user = getUserByEmail(email);

  if(user && user.password === password) {
    response.cookie('user_id', user.id);
    response.redirect('/');
  } else {
    response.status(403);
    response.send("Incorrect email or password");
  }
});

app.post("/logout", (request, response) => {
  response.clearCookie('user_id');
  response.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});