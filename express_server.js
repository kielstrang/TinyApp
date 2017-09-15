const express = require('express'),
  bodyParser = require('body-parser'),
  cookieSession = require('cookie-session'),
  methodOverride = require('method-override'),
  urlRouter = require('./urls'),
  config = require('./lib/config'),
  urldb = require('./lib/url-database'),
  userdb = require('./lib/user-database'),
  check = require('./lib/route-helpers'),
  random = require('./lib/random-helpers'),
  tracking = require('./lib/tracking');

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

app.use('/urls', urlRouter);

//Root redirects to urls or login
app.get('/', (req, res) => {
  if(res.locals.user) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

//Short URL redirects to long URL
app.get('/u/:id', check.urlExists, (req, res) => {
  const url = urldb.getURL(req.params.id);
  tracking.logVisit(url, req.session);
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