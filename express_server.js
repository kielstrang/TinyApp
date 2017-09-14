const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const urldb = require('./url-database');
const userdb = require('./user-database');
const check = require('./express-helpers');
const random = require('./random-helpers');

const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const URL_LENGTH = 6;
const USER_LENGTH = 8;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//get login cookie
app.use(function (request, response, next) {
  response.locals = {
    user: userdb.getUser(request.cookies['user_id'])
  };
  next();
});

//Root redirects to urls or login
app.get('/', (request, response) => {
  if(response.locals.user) {
    response.redirect('/urls');
  } else {
    response.redirect('/login');
  }
});

//Get list of URLs
app.get('/urls', (request, response) => {
  const userURLs = urldb.getUserURLs(response.locals.user);
  response.render('urls_index', { userURLs: userURLs});
});

//Get form for new short URL
app.get('/urls/new', check.isAuthenticated, (request, response) => {
  response.render('urls_new');
});

//URL not found page
app.get('/urls/notfound', (request, response) => {
  response.render('urls_notfound');
});

//Show single shortened URL
app.get('/urls/:id', check.urlExists, (request, response) => {
  const url = urldb.getURL(request.params.id);
  const auth = urldb.userOwnsURL(response.locals.user, url.short);
  response.render('urls_show', { url: url, auth: auth });
});

//Short URL redirects to long URL
app.get('/u/:id', check.urlExists, (request, response) => {
  const shortURL = request.params.id;
  const longURL = urldb.getURL(shortURL).long;
  response.redirect(longURL);
});

//Get login page
app.get('/login', (request, response) => {
  response.render('login');
});

//Get registration page
app.get('/register', (request, response) => {
  response.render('register');
});

//Add new short URL
app.post('/urls', check.isAuthenticated, (request, response) => {
  const newShortURL = random.generateString(URL_LENGTH);
  urldb.saveURL(newShortURL, request.body.longURL, response.locals.user.id);
  response.redirect(`/urls/${newShortURL}`);
});

//Delete URL
app.post('/urls/:id/delete', check.isAuthenticated, check.urlExists, check.userOwnsURL, (request, response) => {
  urldb.deleteURL(request.params.id);
  response.redirect('/urls');
});

//Edit URL
app.post('/urls/:id', check.isAuthenticated, check.urlExists, check.userOwnsURL, (request, response) => {
  urldb.saveURL(request.params.id, request.body.longURL, response.locals.user.id);
  response.redirect('/urls');
});

//Register user
app.post('/register', check.validEmailPassword, check.emailAvailable, (request, response) => {
  const userID = random.generateString(USER_LENGTH);
  const { email, password } = request.body;
  userdb.saveUser(userID, email, password);
  response.cookie('user_id', userID);
  response.redirect('/urls');
});

//Log in
app.post('/login', check.validLogin, (request, response) => {
  const user = userdb.getUserByEmail(request.body.email);
  response.cookie('user_id', user.id);
  response.redirect('/');
});

//Log out
app.post('/logout', (request, response) => {
  response.clearCookie('user_id');
  response.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});