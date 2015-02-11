var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Bonnaroo = function() {
  Bonnaroo.super_.call(this);
};

util.inherits(Bonnaroo, Festival);

Bonnaroo.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Bonnaroo', festivalDateId: 5, url: 'http://lineup.bonnaroo.com/' }
  ];
};

Bonnaroo.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('.ds-lineup').first().find('.ds-level-override').map(function(v,i) {
    return $(this).find('.w').map(function(w,j){
      return $(this).find('a').text().trim();
    }).get();
  }).get();
  this.generateInserts(fest);
};

module.exports = Bonnaroo;