var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Wakarusa = function() {
  Wakarusa.super_.call(this);
};

util.inherits(Wakarusa, Festival);

Wakarusa.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Wakarusa', festivalDateId: 7, url: 'http://www.wakarusa.com/artist-lineup/' }
  ];
};

Wakarusa.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('#container-lineup').find('li').map(function(v,i) {
    return $(this).text().trim();
  }).get();
  this.generateInserts(fest);
};

module.exports = Wakarusa;