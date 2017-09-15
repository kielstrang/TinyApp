const express = require('express'),
  bodyParser = require('body-parser'),
  cookieSession = require('cookie-session'),
  methodOverride = require('method-override'),
  config = require('./lib/config'),
  urldb = require('./lib/url-database'),
  userdb = require('./lib/user-database'),
  check = require('./lib/route-helpers'),
  random = require('./lib/random-helpers'),
  analytics = require('./lib/analytics');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({ name: config.SESSION_NAME, secret: config.SESSION_KEY }));
app.use(methodOverride('_method'));

//read user from session cookie
app.use((req, res, next) => {
  res.locals = {
    user: userdb.getUser(req.session.user_id),
    login: { message: 'Log in to TinyApp:', redirect: '/urls'},
    register: { message: 'Register for TinyApp:', redirect: '/urls'}
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
app.get('/urls', check.isAuthenticated('Log in to view your shortURLs:', '/urls'), (req, res) => {
  const userURLs = urldb.getUserURLs(res.locals.user);
  res.render('urls_index', { userURLs });
});

//Get form for new short URL
app.get('/urls/new', check.isAuthenticated('Log in to add a new shortURL:', '/urls/new'), (req, res) => {
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
  const urlAnalytics = analytics.getAnalytics(url);
  res.render('urls_show', { url, auth, urlAnalytics });
});

//Short URL redirects to long URL
app.get('/u/:id', check.urlExists, (req, res) => {
  const url = urldb.getURL(req.params.id);
  analytics.logVisit(url, req.session);
  res.redirect(url.long);
});

//Get login page
app.get('/login', (req, res) => {
  if(res.locals.user) return res.redirect('/urls');
  res.render('login');
});

//Get registration page
app.get('/register', (req, res) => {
  if(res.locals.user) return res.redirect('/urls');
  res.render('register');
});

//Add new short URL
app.post('/urls', check.isAuthenticated('Log in to add a new shortURL:', '/urls/new'), (req, res) => {
  const newShortURL = random.generateString(config.URL_LENGTH);
  urldb.saveURL(newShortURL, req.body.longURL, res.locals.user.id);
  res.redirect(`/urls/${newShortURL}`);
});

//Delete URL
app.delete('/urls/:id/delete', check.isAuthenticated('Log in to delete a shortURL:', '/urls'), check.urlExists, check.userOwnsURL, (req, res) => {
  urldb.deleteURL(req.params.id);
  res.redirect('/urls');
});

//Edit URL
app.put('/urls/:id', check.isAuthenticated('Log in to edit this shortURL:', '/urls'), check.urlExists, check.userOwnsURL, (req, res) => {
  urldb.saveURL(req.params.id, req.body.longURL, res.locals.user.id);
  res.redirect('/urls');
});

//Register user
app.post('/register', check.validEmailPassword, check.emailAvailable, (req, res) => {
  const userID = random.generateString(config.USER_LENGTH);
  const { email, password } = req.body;
  userdb.saveUser(userID, email, password);
  req.session.user_id = userID;
  res.redirect(req.body.redirect);
});

//Log in
app.post('/login', check.validLogin, (req, res) => {
  const user = userdb.getUserByEmail(req.body.email);
  req.session.user_id = user.id;
  res.redirect(req.body.redirect);
});

//Log out
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.listen(config.PORT, () => {
  console.log(`Example app listening on port ${config.PORT}!`);
});