var fs = require('fs'),
  config = require('./config.json'),
  web = require('./my_modules/web.js')(config, __dirname);

web.startServer();