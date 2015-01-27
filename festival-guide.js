var fs = require('fs'),
  config = require('./config.json'),
  logger = require('./my_modules/logger.js'),
  Web = require('./my_modules/web.js');

var web = new Web(config);
web.startServer();