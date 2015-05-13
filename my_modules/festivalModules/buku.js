var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var BUKU = function() {
  Festival.super_.call(this);
};

util.inherits(BUKU, Festival);

BUKU.prototype.getFestivalUrls = function() {
  return [
    { tag: 'BUKU Music + Art Project', festivalDateId: 19, url: 'http://festivals.jambase.com/festival/buku-music-art-project' }
  ];
};

BUKU.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = this.getFromJamBase($);
  this.generateInserts(fest);
};

module.exports = BUKU;