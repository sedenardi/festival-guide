var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Bestival = function() {
  Festival.super_.call(this);
};

util.inherits(Bestival, Festival);

Bestival.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Bestival', festivalDateId: 56, url: 'http://2015.bestival.net/line-up' }
  ];
};

Bestival.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('ul[data-rel="live-music-from"]').find('li').map(function(){
    return $(this).text().trim();
  }).get().concat(
  $('ul[data-rel="dj-sets-from-rob-da-bank-and-friends"]').find('li').map(function(){
    return $(this).text().trim();
  }).get()).filter(function(v,i){
    return v.length;
  });
  this.generateInserts(fest);
};

module.exports = Bestival;