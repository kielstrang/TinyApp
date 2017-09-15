const express = require('express'),
  userdb = require('../lib/user-database'),
  check = require('../lib/route-helpers');
const router = express.Router();

//Get login page
router.get('/', (req, res) => {
  if(res.locals.user) return res.redirect('/urls');
  res.render('login');
});

//Log in
router.post('/', check.validLogin, (req, res) => {
  const user = userdb.getUserByEmail(req.body.email);
  req.session.user_id = user.id;
  res.redirect(req.body.redirect);
});

module.exports = router;