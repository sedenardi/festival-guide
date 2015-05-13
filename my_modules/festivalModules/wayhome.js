var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Wayhome = function() {
  Festival.super_.call(this);
};

util.inherits(Wayhome, Festival);

Wayhome.prototype.getFestivalUrls = function() {
  return [
    { tag: 'WAYHOME', festivalDateId: 43, url: 'http://festivals.jambase.com/festival/wayhome-music-arts' }
  ];
};

Wayhome.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = this.getFromJamBase($);
  this.generateInserts(fest);
};

module.exports = Wayhome;