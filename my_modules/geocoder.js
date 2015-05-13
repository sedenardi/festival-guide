var util = require('util'),
    events = require('events'),
    logger = require('./logger.js'),
    config = require('../config.json'),
    DB = require('./db.js'),
    geo = require('node-geocoder');

var Geocoder = function() {

  var self = this;

  var geocoderProvider = 'google';
  var httpAdapter = 'http';
  var geocoder = geo.getGeocoder(geocoderProvider, httpAdapter);

  var db = new DB(config);
  var sql = 'select * from locations where lat = 0 or lng = 0 limit 1;';
  var geocodeQuery = function(location, geoRes) {
    return {
      sql: 'update locations set lat = ?, lng = ? where locationId = ?;',
      inserts: [geoRes[0].latitude, geoRes[0].longitude, location.locationId]
    };
  };

  var processNext = function() {
    db.query({ sql: sql }, function(dbRes){
      if (dbRes.length) {
        geocode(dbRes[0]);
      } else {
        db.disconnect(function(){
          self.emit('done');
        });
      }
    });
  };

  var geocode = function(location) {
    var l = location.city + ' ' +
      location.state + ' ' +
      location.country;
    geocoder.geocode(l, function(err,res){
      if (err) {
        logger.log({
          caller: 'Geocoder',
          message: 'error',
          params: { locationString: l },
          data: err,
          minData: l + ' - ' + err.message
        });
        return;
      }
      logger.log({
        caller: 'Geocoder',
        message: 'recording',
        data: res,
        minData: l
      });
      db.query(geocodeQuery(location,res), function(){
        setTimeout(processNext,5000);
      });
    });
  };

  this.start = function() {
    db.connect('Geocoder', processNext);
  };
};

util.inherits(Geocoder, events.EventEmitter);

module.exports = Geocoder;
