var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Summerfest = function() {
  Festival.super_.call(this);
};

util.inherits(Summerfest, Festival);

Summerfest.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Summerfest', festivalDateId: 70, url: 'http://summerfest.com/2015-lineup/' }
  ];
};

Summerfest.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('.lineup-item-title').map(function(v,i) {
    return $(this).text().split('\n')[0].trim();
  }).get();
  this.generateInserts(fest);
};

module.exports = Summerfest;