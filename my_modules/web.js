var events = require('events'),
  express = require('express'),
  hbars = require('./hbars.js'),
  util = require('util'),
  DB = require('./db.js'),
  logger = require('./logger.js'),
  queries = require('./queries.js');

var Web = function(config) {

  var self = this;
  var db = new DB(config);
  var rootDir = process.cwd();
  
  var app = express(),
    hbs = new hbars(rootDir, config);

  app.engine('handlebars', hbs.hbs.engine);

  app.set('views', rootDir + '/web/views');
  app.set('view engine', 'handlebars');
  app.use(express.static(rootDir + config.web.folders.static));

  app.get('/dupes', function (req, res) {
    db.query({
      sql: 'call getDupes();',
      inserts: []
    }, function (dbRes) {
      res.render('dupes', {
        dupes: dbRes[0]
      });
    });
  });

  app.get('/fixDupe', function (req, res) {
    if (typeof req.query.artistId1 !== 'undefined' &&
      typeof req.query.artistId2 !== 'undefined') {
      db.query({
        sql: 'call fixDupe(?,?)',
        inserts: [req.query.artistId1, req.query.artistId2]
      }, function (dbRes) {
        res.sendStatus(200);
      });
    } else {
      res.json(402, { error: 'Must specify artistId1 and artistId2.'});
    }
  });

  app.get('/falsePositive', function (req, res) {
    if (typeof req.query.artistId1 !== 'undefined' &&
      typeof req.query.artistId2 !== 'undefined') {
      db.query({
        sql: 'call markFalsePositive(?,?)',
        inserts: [req.query.artistId1, req.query.artistId2]
      }, function (dbRes) {
        res.sendStatus(200);
      });
    } else {
      res.json(402, { error: 'Must specify artistId1 and artistId2.'});
    }
  });

  app.get('/blacklist', function (req, res) {
    db.query(queries.getBlacklist(), function (dbRes) {
      res.render('blacklist', {
        blacklist: dbRes
      });
    });
  });

  app.get('/addBlacklist', function (req, res) {
    if (typeof req.query.artistId !== 'undefined') {
      db.query(queries.addBlacklist(req.query.artistId), function (dbRes) {
        res.sendStatus(200);
      });
    } else {
      res.json(402, { error: 'Must specify artistId.'});
    }
  });

  app.get('/unBlacklist', function (req, res) {
    if (typeof req.query.artistId !== 'undefined') {
      db.query(queries.unBlacklist(req.query.artistId), function (dbRes) {
        res.sendStatus(200);
      });
    } else {
      res.json(402, { error: 'Must specify artistId.'});
    }
  });

  app.get('/artists.json', function (req,res) {
    var query = queries.getAllArtists();
    db.query(query.cmd, function (dbRes) {
      var artists = query.process(dbRes);
      res.json(artists);
    });
  });

  app.get('/locations.json', function (req,res) {
    var query = queries.getAllLocations();
    db.query(query.cmd, function (dbRes) {
      var locations = query.process(dbRes);
      res.json(locations);
    });
  });

  app.get('/festivals.json', function (req,res) {
    var query = queries.getAllFestivals();
    db.query(query.cmd, function (dbRes) {
      var festivals = query.process(dbRes);
      res.json(festivals);
    });
  });

  app.get('/festivalDates.json', function (req,res) {
    var query = queries.getAllFestivalDates();
    db.query(query.cmd, function (dbRes) {
      var festivalDates = query.process(dbRes);
      res.json(festivalDates);
    });
  });

  app.get('/appearances.json', function (req,res) {
    var query = queries.getAllAppearances();
    db.query(query.cmd, function (dbRes) {
      var appearances = query.process(dbRes);
      res.json(appearances);
    });
  });

  app.get('/chordData.json', function (req,res) {
    var query = queries.getChordData();
    db.query(query.cmd, function (dbRes) {
      var chord = query.process(dbRes);
      res.json(chord);
    });
  });

  app.get('/allInfo.json', function (req,res) {
    var query = queries.getAllInfo();
    db.query(query.cmd, function (dbRes) {
      var info = query.process(dbRes);
      res.json(info);
    });
  });

  this.startServer = function() {
    db.connect('Express', function webDB() {
      app.listen(config.web.port, function webStarted() {
        logger.log({
          caller: 'Express',
          message: 'Web server started',
          params: { port: config.web.port }
        });
      });
    });
  };
  
};

util.inherits(Web, events.EventEmitter);

module.exports = Web;
