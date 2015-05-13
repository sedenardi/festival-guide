var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Bumbershoot = function() {
  Festival.super_.call(this);
};

util.inherits(Bumbershoot, Festival);

Bumbershoot.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Bumbershoot', festivalDateId: 82, url: 'http://festivals.jambase.com/festival/bumbershoot' }
  ];
};

Bumbershoot.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = this.getFromJamBase($);
  this.generateInserts(fest);
};

module.exports = Bumbershoot;