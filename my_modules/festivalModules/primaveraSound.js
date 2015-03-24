var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var PrimaveraSound = function() {
  Festival.super_.call(this);
};

util.inherits(PrimaveraSound, Festival);

PrimaveraSound.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Primavera Sound', festivalDateId: 69, url: 'http://www.primaverasound.es/artistas' }
  ];
};

PrimaveraSound.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('.font01.borderTop1px.width-970.group').map(function(v,i) {
    var str = $(this).find('a').first().text().trim();
    return str.slice(0,str.lastIndexOf('(')).trim();
  }).get();
  this.generateInserts(fest);
};

module.exports = PrimaveraSound;