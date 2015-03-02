var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Ultra = function() {
  Festival.super_.call(this);
};

util.inherits(Ultra, Festival);

Ultra.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Ultra', festivalDateId: 49, url: 'http://festivals.jambase.com/festival/ultra-music-festival' }
  ];
};

Ultra.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = this.getFromJamBase($);
  this.generateInserts(fest);
};

module.exports = Ultra;