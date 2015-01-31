var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var BottleRock = function() {
  BottleRock.super_.call(this);
};

util.inherits(BottleRock, Festival);

BottleRock.prototype.getFestivalUrls = function() {
  return [
    { tag: 'BottleRock', festivalDateId: 14, url: 'http://www.bottlerocknapavalley.com/artists/' }
  ];
};

BottleRock.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('#block-grid').find('a').map(function(v,i) {
    return $(this).text().trim();
  }).get();
  this.generateInserts(fest);
};

module.exports = BottleRock;