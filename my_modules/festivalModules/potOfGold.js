var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var PotOfGold = function() {
  Festival.super_.call(this);
};

util.inherits(PotOfGold, Festival);

PotOfGold.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Pot Of Gold', festivalDateId: 61, url: 'http://festivals.jambase.com/festival/pot-of-gold-music-festival' }
  ];
};

PotOfGold.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = this.getFromJamBase($);
  this.generateInserts(fest);
};

module.exports = PotOfGold;