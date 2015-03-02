var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var LollapaloozaChile = function() {
  Festival.super_.call(this);
};

util.inherits(LollapaloozaChile, Festival);

LollapaloozaChile.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Lollapalooza Chile', festivalDateId: 63, url: 'http://www.lollapaloozacl.com/lineup-2015' }
  ];
};

LollapaloozaChile.prototype.parseFestival = function(fest,data) {
  var self = this;
  var $ = cheerio.load(data);

  fest.artists = $('[data-artist-id]').map(function(v,i) {
    return self.unCapitalize($(this).text().trim());
  }).get();
  this.generateInserts(fest);
};

module.exports = LollapaloozaChile;