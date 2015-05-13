var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Pemberton = function() {
  Festival.super_.call(this);
};

util.inherits(Pemberton, Festival);

Pemberton.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Pemberton', festivalDateId: 78, url: 'http://festivals.jambase.com/festival/pemberton-music-festival' }
  ];
};

Pemberton.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = this.getFromJamBase($);
  this.generateInserts(fest);
};

module.exports = Pemberton;