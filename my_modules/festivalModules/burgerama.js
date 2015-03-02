var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Burgerama = function() {
  Festival.super_.call(this);
};

util.inherits(Burgerama, Festival);

Burgerama.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Burgerama', festivalDateId: 28, url: 'http://festivals.jambase.com/festival/burgerama-four' }
  ];
};

Burgerama.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = this.getFromJamBase($);
  this.generateInserts(fest);
};

module.exports = Burgerama;