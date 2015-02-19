var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Firefly = function() {
  Festival.super_.call(this);
};

util.inherits(Firefly, Festival);

Firefly.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Firefly', festivalDateId: 44, url: 'http://www.jambase.com/Articles/124068/Firefly-Music-Festival-2015-Initial-Lineup-Announcement' }
  ];
};

Firefly.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('.articleWrap').find('p').find('span').map(function(v,i) {
    return $(this).text().trim()
  }).get().filter(function(v,i){
    return v.length;
  });
  this.generateInserts(fest);
};

module.exports = Firefly;