var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var SummerCamp = function() {
  Festival.super_.call(this);
};

util.inherits(SummerCamp, Festival);

SummerCamp.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Summer Camp', festivalDateId: 33, url: 'http://festivals.jambase.com/festival/summer-camp-music-festival' }
  ];
};

SummerCamp.prototype.parseFestival = function(fest,data) {
  var self = this;
  var $ = cheerio.load(data);

  fest.artists = this.getFromJamBase($);
  this.generateInserts(fest);
};

module.exports = SummerCamp;