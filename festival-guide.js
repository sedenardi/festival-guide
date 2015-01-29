var fs = require('fs'),
  config = require('./config.json'),
  logger = require('./my_modules/logger.js'),
  Web = require('./my_modules/web.js'),
  fs = require('fs');
  Coachella = require('./my_modules/festivalModules/coachella.js');

var web = new Web(config);
web.startServer();

var modulePath = './my_modules/festivalModules/';

var findFestivalModules = function() {
  fs.readdir(modulePath, function(err, files) {
    if (err) {
      logger.log({
        caller: 'findFestivalModules',
        message: 'error',
        data: err
      });
      return;
    }
    for (var i = 0; i < files.length; i++) {
      startFestival(files[i]);
    }
  });
};

var startFestival = function(fileName) {
  var festReq = require(modulePath + fileName);
  var fest = new festReq();
  fest.on('done', function(data) {
    logger.log({
      caller: 'Festival',
      message: 'done',
      params: data
    });
  });
  fest.start();
};

findFestivalModules();