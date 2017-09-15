const express = require('express'),
  config = require('./lib/config'),
  urldb = require('./lib/url-database'),
  check = require('./lib/route-helpers'),
  random = require('./lib/random-helpers'),
  tracking = require('./lib/tracking');
const router = express.Router();

//Get list of URLs
router.get('/', check.isAuthenticated('Log in to view your shortURLs:', '/urls'), (req, res) => {
  const userURLs = urldb.getUserURLs(res.locals.user);
  res.render('urls_index', { userURLs });
});

//Get form for new short URL
router.get('/new', check.isAuthenticated('Log in to add a new shortURL:', '/urls/new'), (req, res) => {
  res.render('urls_new');
});

//URL not found page
router.get('/notfound', (req, res) => {
  res.render('urls_notfound');
});

//Show single shortened URL
router.get('/:id', check.urlExists, (req, res) => {
  const url = urldb.getURL(req.params.id);
  const auth = urldb.userOwnsURL(res.locals.user, url.short);
  const analytics = tracking.getAnalytics(url);
  res.render('urls_show', { url, auth, analytics });
});

//Add new short URL
router.post('/', check.isAuthenticated('Log in to add a new shortURL:', '/urls/new'), (req, res) => {
  const newShortURL = random.generateString(config.URL_LENGTH);
  urldb.saveURL(newShortURL, req.body.longURL, res.locals.user.id);
  res.redirect(`/urls/${newShortURL}`);
});

//Delete URL
router.delete('/:id/delete', check.isAuthenticated('Log in to delete a shortURL:', '/urls'), check.urlExists, check.userOwnsURL, (req, res) => {
  urldb.deleteURL(req.params.id);
  res.redirect('/urls');
});

//Edit URL
router.put('/:id', check.isAuthenticated('Log in to edit this shortURL:', '/urls'), check.urlExists, check.userOwnsURL, (req, res) => {
  urldb.saveURL(req.params.id, req.body.longURL, res.locals.user.id);
  res.redirect('/urls');
});

module.exports = router;