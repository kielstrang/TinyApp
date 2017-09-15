const express = require('express'),
  bodyParser = require('body-parser'),
  cookieSession = require('cookie-session'),
  urlRouter = require('./urls'),
  loginRouter = require('./login'),
  registerRouter = require('./register'),
  logoutRouter = require('./logout'),
  config = require('./lib/config'),
  urldb = require('./lib/url-database'),
  userdb = require('./lib/user-database'),
  check = require('./lib/route-helpers'),
  tracking = require('./lib/tracking');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({ name: config.SESSION_NAME, secret: config.SESSION_KEY }));

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
app.use('/login', loginRouter);
app.use('/register', registerRouter);
app.use('/logout', logoutRouter);

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

app.listen(config.PORT, () => {
  console.log(`Example app listening on port ${config.PORT}!`);
});