var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var LollapaloozaBerlin = function() {
  Festival.super_.call(this);
};

util.inherits(LollapaloozaBerlin, Festival);

LollapaloozaBerlin.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Lollapalooza Berlin', festivalDateId: 66, url: 'http://www.lollapaloozade.com/en/2015-lineup/' }
  ];
};

LollapaloozaBerlin.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('[data-artist-id]').map(function(v,i) {
    var a = $(this).find('a').text().trim();
    a = a.split('  ')[0];
    return a;
  }).get().filter(function(v,i) {
    return v.indexOf('???') === -1;
  });
  this.generateInserts(fest);
};

module.exports = LollapaloozaBerlin;