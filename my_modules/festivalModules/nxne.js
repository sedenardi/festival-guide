var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var NXNE = function() {
  Festival.super_.call(this);
};

util.inherits(NXNE, Festival);

NXNE.prototype.getFestivalUrls = function() {
  return [
    { tag: 'NXNE', festivalDateId: 62, url: 'http://nxne.com/lineup/' }
  ];
};

NXNE.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('a').map(function(v,i) {
    return $(this).find('strong').text().trim();
  }).get().filter(function(v,i) {
    return v.length;
  });
  this.generateInserts(fest);
};

module.exports = NXNE;