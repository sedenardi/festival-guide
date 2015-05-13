var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Treefort = function() {
  Festival.super_.call(this);
};

util.inherits(Treefort, Festival);

Treefort.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Treefort Music Fest', festivalDateId: 20, url: 'http://festivals.jambase.com/festival/treefort-music-fest', }
  ];
};

Treefort.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = this.getFromJamBase($);
  this.generateInserts(fest);
};

module.exports = Treefort;