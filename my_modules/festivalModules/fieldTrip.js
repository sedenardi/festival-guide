var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var FieldTrip = function() {
  Festival.super_.call(this);
};

util.inherits(FieldTrip, Festival);

FieldTrip.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Field Trip', festivalDateId: 38, url: 'http://festivals.jambase.com/festival/rock-in-rio-usa-weekend-1' }
  ];
};

FieldTrip.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = [];//this.getFromJamBase($);
  this.generateInserts(fest);
};

module.exports = FieldTrip;