var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var CRSSD = function() {
  Festival.super_.call(this);
};

util.inherits(CRSSD, Festival);

CRSSD.prototype.getFestivalUrls = function() {
  return [
    { tag: 'CRSSD', festivalDateId: 60, url: 'http://festivals.jambase.com/festival/crssd-festival' }
  ];
};

CRSSD.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = this.getFromJamBase($);
  this.generateInserts(fest);
};

module.exports = CRSSD;