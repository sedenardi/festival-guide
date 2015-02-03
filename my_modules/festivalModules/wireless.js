var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Wireless = function() {
  Wireless.super_.call(this);
};

util.inherits(Wireless, Festival);

Wireless.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Wireless', festivalDateId: 27, url: 'http://www.wirelessfestival.co.uk/lineup/artists' }
  ];
};

Wireless.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('.lineup-artist').map(function(v,i){
    return $(this).find('a').map(function(w,j){
      return $(this).text().trim();
    }).get();
  }).get();
  this.generateInserts(fest);
};

module.exports = Wireless;