var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var LightningInABottle = function() {
  Festival.super_.call(this);
};

util.inherits(LightningInABottle, Festival);

LightningInABottle.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Lightning in a Bottle', festivalDateId: 36, url: 'http://festivals.jambase.com/festival/lightning-in-a-bottle' }
  ];
};

LightningInABottle.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = this.getFromJamBase($);
  this.generateInserts(fest);
};

module.exports = LightningInABottle;