var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var BUKU = function() {
  BUKU.super_.call(this);
};

util.inherits(BUKU, Festival);

BUKU.prototype.getFestivalUrls = function() {
  return [
    { tag: 'BUKU Music + Art Project', festivalDateId: 19, url: 'http://thebukuproject.com/lineup/' }
  ];
};

BUKU.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('.artist').map(function(v,i) {
    return $(this).find('.title').map(function(w,j){
      return $(this).text().trim();
    }).get();
  }).get();
  this.generateInserts(fest);
};

module.exports = BUKU;