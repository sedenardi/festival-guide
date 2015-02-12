var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var LightningInABottle = function() {
  LightningInABottle.super_.call(this);
};

util.inherits(LightningInABottle, Festival);

LightningInABottle.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Lightning in a Bottle', festivalDateId: 36, url: 'http://livemusicblog.com/2015/02/05/lightning-in-a-bottle-releases-2015-lineup/' }
  ];
};

LightningInABottle.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('.td-post-text-content').first().find('p').eq(5).html()
    .split('<br>').map(function(v,i) {
      return v.trim();
    });
  this.generateInserts(fest);
};

module.exports = LightningInABottle;