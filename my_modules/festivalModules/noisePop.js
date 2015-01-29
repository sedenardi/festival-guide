var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var NoisePop = function() {
  NoisePop.super_.call(this);
};

util.inherits(NoisePop, Festival);

NoisePop.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Noise Pop', festivalDateId: 8, url: 'http://lineup.noisepop.com/' }
  ];
};

NoisePop.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('.ds-level-override').map(function(v,i) {
    return $(this).find('.w').map(function(w,j){
      return $(this).find('a').text().trim();
    }).get();
  }).get();
  this.generateInserts(fest);
};

module.exports = NoisePop;