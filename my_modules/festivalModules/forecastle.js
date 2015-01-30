var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Forecastle = function() {
  Forecastle.super_.call(this);
};

util.inherits(Forecastle, Festival);

Forecastle.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Forecastle', festivalDateId: 9, url: 'http://lineup.forecastlefest.com/' }
  ];
};

Forecastle.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('.ds-level-override').map(function(v,i) {
    return $(this).find('.w').map(function(w,j){
      return $(this).find('a').text().trim();
    }).get();
  }).get();
  this.generateInserts(fest);
};

module.exports = Forecastle;