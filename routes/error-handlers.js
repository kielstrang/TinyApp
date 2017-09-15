const express = require('express');

module.exports = [
  (error, req, res, next) => {
    if(error.name === 'RequestDataMissing') {
      return res.status(400).send(`Error: ${error.message}`);
    }
    next(error);
  },

  (error, req, res, next) => {
    if(error.name === 'BadURLID') {
      return res.status(404).redirect('/urls/notfound');
    }
    next(error);
  },

  (error, req, res, next) => {
    console.error(error.stack);
    res.status(500).send('TinyApp experienced an error');
  }
];