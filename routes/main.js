const express = require('express');
const router = express.Router();

//Root redirects to urls or login
router.get('/', (req, res) => {
  if(res.locals.user) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

module.exports = router;