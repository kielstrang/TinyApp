const express = require('express'),
  urldb = require('../lib/url-database'),
  check = require('../lib/route-helpers'),
  tracking = require('../lib/tracking');
const router = express.Router();

//Short URL redirects to long URL
router.get('/:id', check.urlExists, (req, res) => {
  const url = urldb.getURL(req.params.id);
  tracking.logVisit(url, req.session);
  res.redirect(url.long);
});


module.exports = router;