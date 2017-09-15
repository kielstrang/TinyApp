const express = require('express');
const urldb = require('../lib/url-database');
const userdb = require('../lib/user-database');

const expressHelpers = {
  isAuthenticated: (message, redirect) => {
    return (req, res, next) => {
      const user = res.locals.user;
      if(user && user.id in userdb.getAllUsers()) return next();

      const error = new Error(message);
      error.name = 'LoginError';
      error.redirect = redirect;
      next(error);
    };
  },
  
  urlExists: (req, res, next) => {
    const shortURL = req.params.id;
    if(shortURL in urldb.getAllURLs()) return next();

    const error = new Error('Bad URL ID');
    error.name = 'BadURLID';
    next(error);
  },
  
  userOwnsURL: (req, res, next) => {
    if(urldb.userOwnsURL(res.locals.user, req.params.id)) return next();

    const error = new Error('You don\'t own this URL.');
    error.name = 'URLPermissionError';
    next(error);
  },
  
  validEmailPassword: (req, res, next) => {
    const { email, password } = req.body;
    if(email && password) return next();

    const error = new Error('Please specify an email and password!');
    error.name = 'RegistrationError';
    next(error);
  },
  
  emailAvailable: (req, res, next) => {
    if(!userdb.getUserByEmail(req.body.email)) return next();

    const error = new Error('This email is already registered!');
    error.name = 'RegistrationError';
    next(error);
  },
  
  validLogin: (req, res, next) => {
    const { email, password } = req.body;
    const user = userdb.getUserByEmail(email);
    if(user && userdb.checkPassword(user, password)) return next();

    const error = new Error('Invalid email or password!');
    error.name = 'LoginError';
    error.redirect = '/urls';
    next(error);
  },

  urlSpecified: (req, res, next) => {
    if(req.body.longURL) return next();

    const error = new Error('No URL specified');
    error.name = 'RequestDataMissing';
    next(error);
  }
};

module.exports = expressHelpers;