var events = require('events'),
  express = require('express'),
  hbars = require('./hbars.js'),
  util = require('util'),
  db = require('./db.js'),
  queries = require('./queries.js');

var Web = function(config, rootDir) {
  if(!(this instanceof Web)) return new Web(config, rootDir);
  var self = this;
  
  var app = express(),
    hbs = new hbars(rootDir, config);

  app.engine('handlebars', hbs.hbs.engine);

  app.configure(function() {
    app.set('views', rootDir + '/web/views');
    app.set('view engine', 'handlebars');
    //app.use(express.logger());
    app.use(express.cookieParser());
    app.use(express.json());
    app.use(express.urlencoded())
    app.use(express.methodOverride());
    app.use(express.session({ secret: 'roygbiv' }));
    app.use(app.router);
    app.use(express.static(rootDir + config.web.folders.static));
  });

  app.get('/dupes', function (req, res) {
    db.query({
      sql: 'call getDupes();',
      inserts: []
    }, function (err, dbRes) {
      if (err) {
          console.log(JSON.stringify(err));
          res.send(500);
          return;
      }
      res.render('dupes', {
        //layout: false,
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
      }, function (err, dbRes) {
        if (err) {
          console.log(JSON.stringify(err));
          res.send(500);
          return;
        }
        res.send(200);
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
      }, function (err, dbRes) {
        if (err) {
          console.log(JSON.stringify(err));
          res.send(500);
          return;
        }
        res.send(200);
      });
    } else {
      res.json(402, { error: 'Must specify artistId1 and artistId2.'});      
    }
  });

  app.get('/dump/artists.json', function (req,res) {
    db.query(queries.getAllArtists(), function (err, dbRes) {
      if (err) {
        console.log(JSON.stringify(err));
        res.send(500);
        return;
      }
      var artists = {};
      for (var i = 0; i < dbRes.length; i++) {
        artists[dbRes[i].artistId] = dbRes[i];
      }
      res.json(artists);
    });
  });

  app.get('/dump/festivals.json', function (req,res) {
    db.query(queries.getAllFestivals('startDate'), function (err, dbRes) {
      if (err) {
        console.log(JSON.stringify(err));
        res.send(500);
        return;
      }
      var festivals = {};
      for (var i = 0; i < dbRes.length; i++) {
        festivals[dbRes[i].festivalId] = dbRes[i];
      }
      res.json(festivals);
    });
  });

  app.get('/dump/appearances.json', function (req,res) {
    db.query(queries.getAllAppearances(), function (err, dbRes) {
      if (err) {
        console.log(JSON.stringify(err));
        res.send(500);
        return;
      }
      var appearances = {};
      appearances.byArtist = {};
      appearances.byFestival= {};
      for (var i = 0; i < dbRes.length; i++) {
        if (typeof appearances.byArtist[dbRes[i].artistId] === 'undefined') {
          appearances.byArtist[dbRes[i].artistId] = [];
        }
        appearances.byArtist[dbRes[i].artistId].push(dbRes[i].festivalId);
        if (typeof appearances.byFestival[dbRes[i].festivalId] === 'undefined') {
          appearances.byFestival[dbRes[i].festivalId] = [];
        }
        appearances.byFestival[dbRes[i].festivalId].push(dbRes[i].artistId);
      }
      res.json(appearances);
    });
  });

  app.get('/dump/locations.json', function (req,res) {
    db.query(queries.getAllLocations(), function (err, dbRes) {
      if (err) {
        console.log(JSON.stringify(err));
        res.send(500);
        return;
      }
      var locations = {};
      for (var i = 0; i < dbRes.length; i++) {
        locations[dbRes[i].locationId] = dbRes[i];
        locations[dbRes[i].locationId].lat = parseFloat(dbRes[i].lat);
        locations[dbRes[i].locationId].lng = parseFloat(dbRes[i].lng);
      }
      res.json(locations);
    });
  });

  this.startServer = function() {
    db.connect(config, 'WEB', function webDB() {
      app.listen(config.web.port, function webStarted() {
        console.log('Created web server on port ' + config.web.port);
      });
    });
  };
  
};

util.inherits(Web, events.EventEmitter);

module.exports = Web;
