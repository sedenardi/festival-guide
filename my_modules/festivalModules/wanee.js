var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Wanee = function() {
  Festival.super_.call(this);
};

util.inherits(Wanee, Festival);

Wanee.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Wanee', festivalDateId: 50, url: 'http://festivals.jambase.com/festival/wanee-music-festival' }
  ];
};

Wanee.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = this.getFromJamBase($);
  this.generateInserts(fest);
};

module.exports = Wanee;