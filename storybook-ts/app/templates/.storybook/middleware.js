const express = require('express');
const path = require('path');

module.exports = (router) => {
  router.use('/css', express.static(path.resolve(__dirname, '../dist/css')));  
};
