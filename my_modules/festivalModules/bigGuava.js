var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var BigGuava = function() {
  BigGuava.super_.call(this);
};

util.inherits(BigGuava, Festival);

BigGuava.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Big Guava', festivalDateId: 13, url: 'http://www.bigguavafest.com/#/artists/' }
  ];
};

BigGuava.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('.artist-name').map(function(v,i) {
    return $(this).text().trim();
  }).get();
  this.generateInserts(fest);
};

module.exports = BigGuava;