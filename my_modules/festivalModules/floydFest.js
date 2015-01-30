var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var FloydFest = function() {
  FloydFest.super_.call(this);
};

util.inherits(FloydFest, Festival);

FloydFest.prototype.getFestivalUrls = function() {
  return [
    { tag: 'FloydFest', festivalDateId: 11, url: 'http://lineup.floydfest.com/' }
  ];
};

FloydFest.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('.ds-level-override').map(function(v,i) {
    return $(this).find('.w').map(function(w,j){
      return $(this).find('img').attr('alt').trim();
    }).get();
  }).get();
  this.generateInserts(fest);
};

module.exports = FloydFest;