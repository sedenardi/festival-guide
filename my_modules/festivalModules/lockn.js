var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Lockn = function() {
  Festival.super_.call(this);
};

util.inherits(Lockn, Festival);

Lockn.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Lockn', festivalDateId: 59, url: 'http://www.locknfestival.com/lineup/2015.html' }
  ];
};

Lockn.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('.lineup-module').find('li').map(function(v,i) {
    return $(this).text().trim();
  }).get();
  this.generateInserts(fest);
};

module.exports = Lockn;