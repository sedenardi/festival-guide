var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var LollapaloozaArgentina = function() {
  Festival.super_.call(this);
};

util.inherits(LollapaloozaArgentina, Festival);

LollapaloozaArgentina.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Lollapalooza Argentina', festivalDateId: 64, url: 'http://www.lollapaloozaar.com/lineup-2015-2' }
  ];
};

LollapaloozaArgentina.prototype.parseFestival = function(fest,data) {
  var self = this;
  var $ = cheerio.load(data);

  fest.artists = $('[data-artist-id]').map(function(v,i) {
    return self.replaceWhitespace($(this).text().trim());
  }).get();
  this.generateInserts(fest);
};

module.exports = LollapaloozaArgentina;