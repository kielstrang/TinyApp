const express = require('express'),
  config = require('./lib/config'),
  userdb = require('./lib/user-database'),
  check = require('./lib/route-helpers'),
  random = require('./lib/random-helpers');
const router = express.Router();

//Get registration page
router.get('/', (req, res) => {
  if(res.locals.user) return res.redirect('/urls');
  res.render('register');
});

//Register user
router.post('/', check.validEmailPassword, check.emailAvailable, (req, res) => {
  const userID = random.generateString(config.USER_LENGTH);
  const { email, password } = req.body;
  userdb.saveUser(userID, email, password);
  req.session.user_id = userID;
  res.redirect(req.body.redirect);
});

module.exports = router;