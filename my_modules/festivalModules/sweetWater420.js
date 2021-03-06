var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var SweetWater420 = function() {
  Festival.super_.call(this);
};

util.inherits(SweetWater420, Festival);

SweetWater420.prototype.getFestivalUrls = function() {
  return [
    { tag: 'SweetWater 420', festivalDateId: 45, url: 'http://festivals.jambase.com/festival/sweetwater-420-fest' }
  ];
};

SweetWater420.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = this.getFromJamBase($);
  this.generateInserts(fest);
};

module.exports = SweetWater420;