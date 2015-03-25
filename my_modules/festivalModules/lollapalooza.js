var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Lollapalooza = function() {
  Festival.super_.call(this);
};

util.inherits(Lollapalooza, Festival);

Lollapalooza.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Lollapalooza', festivalDateId: 74, url: 'http://www.lollapalooza.com/2015-lineup/' }
  ];
};

Lollapalooza.prototype.parseFestival = function(fest,data) {
  var self = this;
  var $ = cheerio.load(data);

  fest.artists = $('[data-artist-id]').map(function(v,i) {
    return self.unCapitalize($(this).text().trim());
  }).get();
  this.generateInserts(fest);
};

module.exports = Lollapalooza;