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

  app.get('/', function (req, res) {
    res.render('index');
  });

  app.get('/venn', function (req, res) {
    db.query({
      sql: queries.getUniqueFestivals(),
      inserts: []
    }, function (err,fests) {
      if (err) {
        console.log(JSON.stringify(err));
        res.end();
        return;
      }
      res.render('venn', {
        layout: false,
        festivals: fests
      });
    });
  });

  app.get('/artists', function (req, res) {
    res.render('artists', {
        layout: false      
    });
  });

  app.get('/festivals', function (req, res) {
    db.query({
      sql: queries.getAllFestivals('startDate'),
      inserts: []
    }, function (err,fests) {
      if (err) {
        console.log(JSON.stringify(err));
        res.end();
        return;
      }
      res.render('festivals', {
        layout: false,
        festivals: fests
      });
    });
  });

  app.get('/getFestivalInfo', function (req, res) {
    if (typeof req.query.festivalId !== 'undefined') {
      var q = queries.getFestivalInfo(req.query.festivalId);
      db.query({
        sql: q.festival + ' ' + q.artists,
        inserts: []
      }, function (err, dbRes) {
        if (err) {
          console.log(JSON.stringify(err));
          res.end();
          return;
        }
        res.render('festivalInfo', {
          layout: false,
          festival: dbRes[0][0],
          artists: dbRes[1]
        });
      });
    } else {
      res.json(402, { error: 'Must specify festivalId.'});
    }
  });

  app.get('/getVennDiagramData.json', function (req, res) {
    if (typeof req.query.festivalIds !== 'undefined') {
      db.query({
        sql: queries.getOrderedFestivals(req.query.festivalIds),
        inserts: []
      }, function (err, festivals) {
        if (err) {
          console.log(JSON.stringify(err));
          res.end();
          return;
        }
        var q = queries.getOverlapsForFestivals(festivals);
        db.query({
          sql: q.sets + ' ' + q.overlaps,
          inserts: []
        }, function (innErr, dbRes) {
          if (innErr) {
            console.log(JSON.stringify(innErr));
            res.end();
            return;
          }
          res.json({
            sets: JSON.parse(dbRes[0][0].sets),
            overlaps: JSON.parse(dbRes[1][0].overlaps)
          });        
        });
      });
    } else {
      res.json(402, { error: 'Must specify festivalIds.'});
    }
  });

  app.get('/getCommonArtists.json', function (req, res) {
    if (typeof req.query.festivalIds !== 'undefined') {
      db.query({
        sql: queries.getInCommonForFestivals(req.query.festivalIds),
        inserts: []
      }, function (err, artists) {
        if (err) {
          console.log(JSON.stringify(err));
          res.end();
          return;
        }
        res.json(artists);
      })
    } else {
      res.json(402, { error: 'Must specify festivalIds.'});
    }
  });

  app.get('/getAllArtists.json', function (req, res) {
    db.query({
      sql: queries.getAllArtists(),
      inserts: []
    }, function (err, artists) {
      if (err) {
        console.log(JSON.stringify(err));
        res.end();
        return;
      }
      res.json(artists);
    })
  });

  app.get('/getArtistInfo.json', function (req, res) {
    if (typeof req.query.artistId !== 'undefined') {
      db.query({
        sql: queries.getArtistInfo(req.query.artistId),
        inserts: []
      }, function (err, artistInfo) {
        if (err) {
          console.log(JSON.stringify(err));
          res.end();
          return;
        }
        res.json(artistInfo);
      });
    } else {
      res.json(402, { error: 'Must specify artistId.'});
    }
  });

  app.get('/getArtistInfo', function (req, res) {
    if (typeof req.query.artistId !== 'undefined') {
      db.query({
        sql: queries.getArtistInfo(req.query.artistId),
        inserts: []
      }, function (err, artistInfo) {
        if (err) {
          console.log(JSON.stringify(err));
          res.end();
          return;
        }
        res.render('artistInfo', {
          layout: false,
          appearances: artistInfo
        });
      });
    } else {
      res.json(402, { error: 'Must specify artistId.'});
    }
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
