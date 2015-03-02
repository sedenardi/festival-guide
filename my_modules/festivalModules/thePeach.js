var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var ThePeach = function() {
  Festival.super_.call(this);
};

util.inherits(ThePeach, Festival);

ThePeach.prototype.getFestivalUrls = function() {
  return [
    { tag: 'The Peach', festivalDateId: 48, url: 'http://festivals.jambase.com/festival/peach-music-festival' }
  ];
};

ThePeach.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = this.getFromJamBase($);
  this.generateInserts(fest);
};

module.exports = ThePeach;