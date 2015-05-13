var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var NorthCoast = function() {
  Festival.super_.call(this);
};

util.inherits(NorthCoast, Festival);

NorthCoast.prototype.getFestivalUrls = function() {
  return [
    { tag: 'North Coast', festivalDateId: 77, url: 'http://festivals.jambase.com/festival/north-coast-music-festival' }
  ];
};

NorthCoast.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = this.getFromJamBase($);
  this.generateInserts(fest);
};

module.exports = NorthCoast;