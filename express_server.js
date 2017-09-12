var express = require("express");
var crypto = require("crypto");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString(strLength) {
  let str = "";
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < strLength; i++) {
    text += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return str;
}

app.get("/urls", (request, response) => {
  let templateVars = { urls: urlDatabase };
  response.render("urls_index", templateVars);
});

app.get("/urls/new", (request, response) => {
  response.render("urls_new");
});

app.get("/urls/notfound", (request, response) => {
  response.render("urls_notfound");
});

app.get("/urls/:id", (request, response) => {
  let templateVars = { shortURL: request.params.id, url: urlDatabase[request.params.id] };
  response.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (request, response) => {
  const shortURL = request.params.shortURL;
  if (shortURL in urlDatabase) {
    const longURL = urlDatabase[shortURL];
    response.redirect(longURL);
  } else {
    response.redirect('/urls/notfound');
  }
});

app.get("/urls.json", (request, response) => {
  response.json(urlDatabase);
});

app.post("/urls", (request, response) => {
  const shortURL = generateRandomString(6);
  const longURL = request.body.longURL;
  urlDatabase[shortURL] = longURL;
  response.redirect(`/urls/${shortURL}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});