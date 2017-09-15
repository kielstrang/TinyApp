const express = require('express');

module.exports = [
  (error, req, res, next) => {
    if(error.name === 'RequestDataMissing') {
      return res.status(400).send(`Error: ${error.message}`);
    }
    next();
  },

  (error, req, res, next) => {
    console.error(error.stack);
    res.status(500).send('TinyApp experienced an error');
  }
];