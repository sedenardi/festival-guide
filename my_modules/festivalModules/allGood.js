var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var AllGood = function() {
  Festival.super_.call(this);
};

util.inherits(AllGood, Festival);

AllGood.prototype.getFestivalUrls = function() {
  return [
    { tag: 'All Good', festivalDateId: 58, url: 'http://festivals.jambase.com/festival/all-good-music-festival' }
  ];
};

AllGood.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = this.getFromJamBase($);
  this.generateInserts(fest);
};

module.exports = AllGood;