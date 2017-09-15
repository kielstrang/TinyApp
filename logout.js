const express = require('express');
const router = express.Router();

//Log out
router.post('/', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

module.exports = router;