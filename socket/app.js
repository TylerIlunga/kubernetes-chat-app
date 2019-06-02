const bodyParser = require('body-parser');
const express = require('express');
const logger = require('morgan');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(logger('dev'));

module.exports = app;
