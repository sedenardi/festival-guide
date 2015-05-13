var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Landmark = function() {
  Festival.super_.call(this);
};

util.inherits(Landmark, Festival);

Landmark.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Landmark', festivalDateId: 76, url: 'http://festivals.jambase.com/festival/landmark-music-festival' }
  ];
};

Landmark.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = this.getFromJamBase($);
  this.generateInserts(fest);
};

module.exports = Landmark;