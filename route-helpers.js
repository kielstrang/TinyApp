const express = require('express');
const urldb = require('./url-database');
const userdb = require('./user-database');

const expressHelpers = {
  isAuthenticated: (message, redirect) => {
    return (req, res, next) => {
      redirect = redirect.replace(':id', req.params.id);
      res.locals.login = {message, redirect};
      const user = res.locals.user;
      if(user && user.id in userdb.getAllUsers()) return next();
      res.render('login');
    };
  },
  
  urlExists: (req, res, next) => {
    const shortURL = req.params.id;
    if(shortURL in urldb.getAllURLs()) return next();
    res.status(404);
    res.redirect('/urls/notfound');
  },
  
  userOwnsURL: (req, res, next) => {
    if(urldb.userOwnsURL(res.locals.user, req.params.id)) return next();
    res.status(401);
    res.send("You don't own this URL.");
  },
  
  validEmailPassword: (req, res, next) => {
    const { email, password } = req.body;
    if(email && password) return next();
    res.status(400);
    res.locals.register.message = 'Please specify an email and password!';
    res.render('register');
  },
  
  emailAvailable: (req, res, next) => {
    if(!userdb.getUserByEmail(req.body.email)) return next();
    res.status(400);
    res.locals.register.message = 'This email is already registered!';
    res.render('register');
  },
  
  validLogin: (req, res, next) => {
    const { email, password } = req.body;
    const user = userdb.getUserByEmail(email);
  
    if(user && userdb.checkPassword(user, password)) return next();
    res.status(401);
    res.locals.login.message = 'Invalid email or password!';
    res.render('login');
  }
};

module.exports = expressHelpers;