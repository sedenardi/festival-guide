var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var BigGuava = function() {
  Festival.super_.call(this);
};

util.inherits(BigGuava, Festival);

BigGuava.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Big Guava', festivalDateId: 13, url: 'http://festivals.jambase.com/festival/big-guava-music-festival' }
  ];
};

BigGuava.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = this.getFromJamBase($);
  this.generateInserts(fest);
};

module.exports = BigGuava;