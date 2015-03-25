var fs = require('fs'),
  config = require('./config.json'),
  logger = require('./my_modules/logger.js'),
  Web = require('./my_modules/web.js'),
  fs = require('fs'),
  Geocoder = require('./my_modules/geocoder.js'),
  DB = require('./my_modules/db.js'),
  queries = require('./my_modules/queries.js');

var modulePath = './my_modules/festivalModules/',
    festivalModules = [],
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
    festivalModules = files;
    festivalsFound = festivalModules.length;
    startFestival();
  });
};

var startFestival = function(fileName) {
  var fileName = festivalModules[festivalsDone];
  var festReq = require(modulePath + fileName);
  var fest = new festReq();
  fest.on('done', function(data) {
    logger.log({
      caller: 'Festival',
      message: 'done',
      params: data,
      minData: data
    });
    festivalsDone++;
    checkFestDone();
  });
  fest.start();
};

var checkFestDone = function() {
  if (festivalsDone === festivalsFound) {
    logger.log({
      caller: 'checkFestDone',
      message: 'Festivals done'
    });
    var geocoder = new Geocoder();
    geocoder.on('done', function() {
      logger.log({
        caller: 'checkFestDone',
        message: 'Geocoder done'
      });
      dumpFile();
    });
    geocoder.start();
  } else {
    startFestival();
  }
};

var dumpFile = function(cb) {
  var db = new DB(config);
  db.connect('Festival Guide', function() {
    var query = queries.getAllInfo();
    db.query(query.cmd, function (dbRes) {
      var info = query.process(dbRes);
      var str = JSON.stringify(info);
      var fileName = './web/static/allInfo.json';
      fs.writeFile(fileName,str,function(err){
        if (err) {
          logger.log({
            caller: 'dumpFile',
            message: 'error',
            data: err
          });
        }
        db.disconnect(function(){
          logger.log({
            caller: 'dumpFile',
            message: 'done'
          });
          if (typeof cb === 'function')
            cb();
        });
      });
    });
  });
};

var web = new Web(dumpFile);
web.startServer();

findFestivalModules();