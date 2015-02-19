var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Hangout = function() {
  Festival.super_.call(this);
};

util.inherits(Hangout, Festival);

Hangout.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Hangout', festivalDateId: 8, url: 'http://lineup.hangoutmusicfest.com/' }
  ];
};

Hangout.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('.ds-level-override').map(function(v,i) {
    return $(this).find('.w').map(function(w,j){
      return $(this).find('a').text().trim();
    }).get();
  }).get();
  this.generateInserts(fest);
};

module.exports = Hangout;