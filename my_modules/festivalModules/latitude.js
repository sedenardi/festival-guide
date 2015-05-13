var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Latitude = function() {
  Festival.super_.call(this);
};

util.inherits(Latitude, Festival);

Latitude.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Latitude', festivalDateId: 86, url: 'http://www.latitudefestival.com/line-up/artist-a-z' }
  ];
};

Latitude.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('._grid').find('li').map(function() {
    return $(this).find('.media--title').text().trim();
  }).get();
  this.generateInserts(fest);
};

module.exports = Latitude;