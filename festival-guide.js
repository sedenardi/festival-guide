var fs = require('fs'),
  config = require('./config.json'),
  logger = require('./my_modules/logger.js'),
  Web = require('./my_modules/web.js'),
  fs = require('fs');

var web = new Web(config);
web.startServer();

var modulePath = './my_modules/festivalModules/',
    festivalsFound = 0,
    festivalsDone = 0;

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
    festivalsFound = files.length;
    files.forEach(startFestival);
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
    festivalsDone++;
    checkDone();
  });
  fest.start();
};

var checkDone = function() {
  if (festivalsDone === festivalsFound) {
    logger.log({
      caller: 'checkDone',
      message: 'done'
    });
  }
};

findFestivalModules();