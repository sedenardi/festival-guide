var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var OutsideLands = function() {
  Festival.super_.call(this);
};

util.inherits(OutsideLands, Festival);

OutsideLands.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Outside Lands', festivalDateId: 68, url: 'http://festivals.jambase.com/festival/outside-lands' }
  ];
};

OutsideLands.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = this.getFromJamBase($);
  this.generateInserts(fest);
};

module.exports = OutsideLands;