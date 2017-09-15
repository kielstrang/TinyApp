const express = require('express'),
  bodyParser = require('body-parser'),
  cookieSession = require('cookie-session'),
  urlRouter = require('./urls'),
  loginRouter = require('./login'),
  registerRouter = require('./register'),
  logoutRouter = require('./logout'),
  redirectRouter = require('./redirect'),
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
app.use('/u', redirectRouter);

//Root redirects to urls or login
app.get('/', (req, res) => {
  if(res.locals.user) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});
app.listen(config.PORT, () => {
  console.log(`Example app listening on port ${config.PORT}!`);
});