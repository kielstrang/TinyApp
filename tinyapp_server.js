const express = require('express'),
  bodyParser = require('body-parser'),
  cookieSession = require('cookie-session'),
  config = require('./lib/config'),
  userdb = require('./lib/user-database');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({ name: config.SESSION_NAME, secret: config.SESSION_KEY }));

//read user from session cookie
app.use((req, res, next) => {
  res.locals.user = userdb.getUser(req.session.user_id);
  next();
});

app.use('/', require('./routes/main'));
app.use('/urls', require('./routes/urls'));
app.use('/login', require('./routes/login'));
app.use('/register', require('./routes/register'));
app.use('/logout', require('./routes/logout'));
app.use('/u', require('./routes/redirect'));

app.use(...require('./routes/error-handlers'));

app.listen(config.PORT, () => {
  console.log(`TinyApp listening on port ${config.PORT}!`);
});