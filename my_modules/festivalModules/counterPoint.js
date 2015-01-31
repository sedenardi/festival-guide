var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var CounterPoint = function() {
  CounterPoint.super_.call(this);
};

util.inherits(CounterPoint, Festival);

CounterPoint.prototype.getFestivalUrls = function() {
  return [
    { tag: 'CounterPoint', festivalDateId: 16, url: 'http://www.counterpointfestival.com/2015-lineup-details/' }
  ];
};

CounterPoint.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('.summary__title').map(function(v,i) {
    return $(this).text().trim();
  }).get();
  this.generateInserts(fest);
};

module.exports = CounterPoint;