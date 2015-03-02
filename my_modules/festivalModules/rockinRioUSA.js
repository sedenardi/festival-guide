var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var RockinRioUSA = function() {
  Festival.super_.call(this);
};

util.inherits(RockinRioUSA, Festival);

RockinRioUSA.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Rock in Rio USA', festivalDateId: 54, url: 'http://festivals.jambase.com/festival/rock-in-rio-usa-weekend-1' },
    { tag: 'Rock in Rio USA', festivalDateId: 55, url: 'http://festivals.jambase.com/festival/rock-in-rio-usa-weekend-2' }
  ];
};

RockinRioUSA.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = [];//this.getFromJamBase($);
  this.generateInserts(fest);
};

module.exports = RockinRioUSA;