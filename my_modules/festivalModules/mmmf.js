var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var MMMF = function() {
  MMMF.super_.call(this);
};

util.inherits(MMMF, Festival);

MMMF.prototype.getFestivalUrls = function() {
  return [
    { tag: 'McDowell Mountain Music Festival', festivalDateId: 18, url: 'http://mmmf.com/line-up/' }
  ];
};

MMMF.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('.tablepress').map(function(v,i) {
    return $(this).find('.column-1').map(function(w,j){
      return $(this).text().trim();
    }).get();
  }).get();
  this.generateInserts(fest);
};

module.exports = MMMF;