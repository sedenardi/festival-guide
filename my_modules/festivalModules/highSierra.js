var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var HighSierra = function() {
  HighSierra.super_.call(this);
};

util.inherits(HighSierra, Festival);

HighSierra.prototype.getFestivalUrls = function() {
  return [
    { tag: 'High Sierra', festivalDateId: 17, url: 'http://www.highsierramusic.com/lineup/artist-info/' }
  ];
};

HighSierra.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('strong').map(function(v,i) {
    return $(this).find('a').map(function(w,j){
      return $(this).text().trim();
    }).get();
  }).get();
  this.generateInserts(fest);
};

module.exports = HighSierra;