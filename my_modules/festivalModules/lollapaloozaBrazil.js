var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var LollapaloozaBrazil = function() {
  Festival.super_.call(this);
};

util.inherits(LollapaloozaBrazil, Festival);

LollapaloozaBrazil.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Lollapalooza Brazil', festivalDateId: 65, url: 'http://www.lollapaloozabr.com/line-up-2015' }
  ];
};

LollapaloozaBrazil.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('[data-artist-id]').map(function(v,i) {
    return $(this).text().trim();
  }).get();
  this.generateInserts(fest);
};

module.exports = LollapaloozaBrazil;