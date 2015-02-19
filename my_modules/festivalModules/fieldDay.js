var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var FieldDay = function() {
  Festival.super_.call(this);
};

util.inherits(FieldDay, Festival);

FieldDay.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Field Day', festivalDateId: 31, url: 'http://fielddayfestivals.com/line-up/line-up-2015/' }
  ];
};

FieldDay.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('.artistlink').map(function(v,i) {
    return $(this).text().trim();
  }).get();
  this.generateInserts(fest);
};

module.exports = FieldDay;