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

//pass login cookie and urlDatabase to templates using local variables
app.use(function (request, response, next) {
  response.locals = {
    username : request.cookies['username'],
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

app.post("/login", (request, response) => {
  response.cookie('username', request.body.username);
  response.redirect('/urls');
});

app.post("/logout", (request, response) => {
  response.clearCookie('username');
  response.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});