var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var ACL = function() {
  Festival.super_.call(this);
};

util.inherits(ACL, Festival);

ACL.prototype.getFestivalUrls = function() {
  return [
    { tag: 'ACL Week 1', festivalDateId: 83, url: 'http://festivals.jambase.com/festival/austin-city-limits-music-festival-weekend-1' },
    { tag: 'ACL Week 2', festivalDateId: 84, url: 'http://festivals.jambase.com/festival/austin-city-limits-music-festival-weekend-2' }
  ];
};

ACL.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = this.getFromJamBase($);
  this.generateInserts(fest);
};

module.exports = ACL;