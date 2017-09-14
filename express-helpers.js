const express = require('express');
const urldb = require('./url-database');
const userdb = require('./user-database');

const expressHelpers = {
  isAuthenticated: (req, res, next) => {
    const user = res.locals.user;
    if(user && user.id in userdb.getAllUsers()) return next();
    res.redirect('/login');
  },
  
  urlExists: (req, res, next) => {
    const shortURL = req.params.id;
    if (shortURL in urldb.getAllURLs()) return next();
    res.status(404);
    res.redirect('/urls/notfound');
  },
  
  userOwnsURL: (req, res, next) => {
    if (urldb.userOwnsURL(res.locals.user, req.params.id)) return next();
    res.status(401);
    res.send("You don't own this URL.");
  },
  
  validEmailPassword: (req, res, next) => {
    const { email, password } = req.body;
    if (email && password) return next();
    res.status(400);
    res.send('Please specify an email and password');
  },
  
  emailAvailable: (req, res, next) => {
    if (!userdb.getUserByEmail(req.body.email)) return next();
    res.status(400);
    res.send('This email is already registered');
  },
  
  validLogin: (req, res, next) => {
    const { email, password } = req.body;
    const user = userdb.getUserByEmail(email);
  
    if(user && userdb.checkPassword(user, password)) return next();
    res.status(401);
    res.send('Incorrect email or password');
  }
};

module.exports = expressHelpers;