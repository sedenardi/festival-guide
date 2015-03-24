var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Bunbury = function() {
  Festival.super_.call(this);
};

util.inherits(Bunbury, Festival);

Bunbury.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Bunbury', festivalDateId: 71, url: 'http://www.bunburyfestival.com/lineup-2015' }
  ];
};

Bunbury.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('.lineup').find('li').map(function(v,i) {
    return $(this).find('span').first().text().trim();
  }).get().concat($('.lineup-list').find('li').map(function(v,i) {
    return $(this).text().trim();
  }).get());
  this.generateInserts(fest);
};

module.exports = Bunbury;