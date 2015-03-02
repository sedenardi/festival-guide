var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var BostonCalling = function() {
  Festival.super_.call(this);
};

util.inherits(BostonCalling, Festival);

BostonCalling.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Boston Calling', festivalDateId: 46, url: 'http://festivals.jambase.com/festival/boston-calling-spring' }
  ];
};

BostonCalling.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = this.getFromJamBase($);
  this.generateInserts(fest);
};

module.exports = BostonCalling;