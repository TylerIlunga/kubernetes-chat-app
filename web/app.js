const bodyParser = require('body-parser');
const cors = require('cors'); // Just in case...
const ejs = require('ejs');
const express = require('express');
const logger = require('morgan');
const routes = require('./src/routes');

const app = express();
app.set('view engine', 'ejs');
app.set('views', __dirname + '/src/views');
// app.use(cors());
app.use(express.static(__dirname + '/src/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use('/', routes);

module.exports = app;
