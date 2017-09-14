const express = require('express'),
  bodyParser = require('body-parser'),
  cookieSession = require('cookie-session'),
  urldb = require('./url-database'),
  userdb = require('./user-database'),
  check = require('./route-helpers'),
  random = require('./random-helpers');

const PORT = process.env.PORT || 8080, // default port 8080
  URL_LENGTH = 6,
  USER_LENGTH = 8,
  SESSION_NAME = 'tinyapp-session',
  SESSION_KEY = 'correct-horse-battery-staple';

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: SESSION_NAME,
  secret: SESSION_KEY
}));

//read user from session cookie
app.use(function (req, res, next) {
  res.locals = {
    user: userdb.getUser(req.session.user_id)
  };
  next();
});

//Root redirects to urls or login
app.get('/', (req, res) => {
  if(res.locals.user) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

//Get list of URLs
app.get('/urls', (req, res) => {
  const userURLs = urldb.getUserURLs(res.locals.user);
  res.render('urls_index', { userURLs: userURLs});
});

//Get form for new short URL
app.get('/urls/new', check.isAuthenticated, (req, res) => {
  res.render('urls_new');
});

//URL not found page
app.get('/urls/notfound', (req, res) => {
  res.render('urls_notfound');
});

//Show single shortened URL
app.get('/urls/:id', check.urlExists, (req, res) => {
  const url = urldb.getURL(req.params.id);
  const auth = urldb.userOwnsURL(res.locals.user, url.short);
  res.render('urls_show', { url: url, auth: auth });
});

//Short URL redirects to long URL
app.get('/u/:id', check.urlExists, (req, res) => {
  const shortURL = req.params.id;
  const longURL = urldb.getURL(shortURL).long;
  res.redirect(longURL);
});

//Get login page
app.get('/login', (req, res) => {
  res.render('login');
});

//Get registration page
app.get('/register', (req, res) => {
  res.render('register');
});

//Add new short URL
app.post('/urls', check.isAuthenticated, (req, res) => {
  const newShortURL = random.generateString(URL_LENGTH);
  urldb.saveURL(newShortURL, req.body.longURL, res.locals.user.id);
  res.redirect(`/urls/${newShortURL}`);
});

//Delete URL
app.post('/urls/:id/delete', check.isAuthenticated, check.urlExists, check.userOwnsURL, (req, res) => {
  urldb.deleteURL(req.params.id);
  res.redirect('/urls');
});

//Edit URL
app.post('/urls/:id', check.isAuthenticated, check.urlExists, check.userOwnsURL, (req, res) => {
  urldb.saveURL(req.params.id, req.body.longURL, res.locals.user.id);
  res.redirect('/urls');
});

//Register user
app.post('/register', check.validEmailPassword, check.emailAvailable, (req, res) => {
  const userID = random.generateString(USER_LENGTH);
  const { email, password } = req.body;
  userdb.saveUser(userID, email, password);
  req.session.user_id = userID;
  res.redirect('/urls');
});

//Log in
app.post('/login', check.validLogin, (req, res) => {
  const user = userdb.getUserByEmail(req.body.email);
  req.session.user_id = user.id;
  res.redirect('/');
});

//Log out
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});