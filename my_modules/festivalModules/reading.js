var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Reading = function() {
  Festival.super_.call(this);
};

util.inherits(Reading, Festival);

Reading.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Reading', festivalDateId: 30, url: 'http://www.readingfestival.com/line-up/artist-a-z' }
  ];
};

Reading.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('a.media--grid__item').map(function(v,i) {
    return $(this).attr('title').trim();
  }).get();
  this.generateInserts(fest);
};

module.exports = Reading;