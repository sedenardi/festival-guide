var events = require('events'),
  express = require('express'),
  hbars = require('./hbars.js'),
  util = require('util'),
  db = require('./db.js');

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
  
  app.get('/artistsWithAppearances', function (req, res) {
    var sql = 
'Select \
  ar.artistId, \
  ar.artist as artistName, \
  ap.appearanceId, \
  ap.setTime, \
  fest.festivalId, \
  fest.festival, \
  fest.week, \
  fest.location, \
  fest.startDate, \
  fest.endDate \
from artists ar \
  inner join appearances ap \
    on ap.artistId = ar.artistId \
  inner join festivals fest \
    on fest.festivalId = ap.festivalId;';
    db.query({
      sql: sql,
      inserts: []
    }, function(err, dbRes) {
      if (err) {
        console.log(JSON.stringify(err));
        res.end();
        return;
      }
      res.render('artistsWithAppearances', {
        artists: dbRes
      });      
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
