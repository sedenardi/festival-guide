var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Aura = function() {
  Festival.super_.call(this);
};

util.inherits(Aura, Festival);

Aura.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Aura', festivalDateId: 47, url: 'http://festivals.jambase.com/festival/aura-music-arts-festival' }
  ];
};

Aura.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = this.getFromJamBase($);
  this.generateInserts(fest);
};

module.exports = Aura;