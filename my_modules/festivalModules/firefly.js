var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Firefly = function() {
  Festival.super_.call(this);
};

util.inherits(Firefly, Festival);

Firefly.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Firefly', festivalDateId: 44, url: 'http://festivals.jambase.com/festival/firefly-music-festival' }
  ];
};

Firefly.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = this.getFromJamBase($);
  this.generateInserts(fest);
};

module.exports = Firefly;