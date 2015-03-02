var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var ElectricForest = function() {
  Festival.super_.call(this);
};

util.inherits(ElectricForest, Festival);

ElectricForest.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Electric Forest', festivalDateId: 37, url: 'http://festivals.jambase.com/festival/electric-forest' }
  ];
};

ElectricForest.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = this.getFromJamBase($);
  this.generateInserts(fest);
};

module.exports = ElectricForest;