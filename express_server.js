var express = require("express");
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');

var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
    urlDatabase: urlDatabase
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

app.get("/urls", (request, response) => {
  response.render("urls_index");
});

app.get("/urls/new", (request, response) => {
  response.render("urls_new");
});

app.get("/urls/notfound", (request, response) => {
  response.render("urls_notfound");
});

app.get("/urls/:id", (request, response) => {
  response.render("urls_show", { shortURL: request.params.id });
});

app.get("/u/:id", (request, response) => {
  const shortURL = request.params.id;
  if (shortURL in urlDatabase) {
    const longURL = urlDatabase[shortURL];
    response.redirect(longURL);
  } else {
    response.redirect('/urls/notfound');
  }
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
  urlDatabase[shortURL] = longURL;
  response.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (request, response) => {
  const shortURL = request.params.id;
  if (shortURL in urlDatabase) {
    delete urlDatabase[shortURL];
    response.redirect('/urls');
  } else {
    response.redirect('/urls/notfound');
  }
});

app.post("/urls/:id", (request, response) => {
  const shortURL = request.params.id;
  const longURL = request.body.longURL;
  if (shortURL in urlDatabase) {
    urlDatabase[shortURL] = longURL;
    response.redirect('/urls');
  } else {
    response.redirect('/urls/notfound');
  }
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