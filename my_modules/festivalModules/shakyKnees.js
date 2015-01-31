var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var ShakyKnees = function() {
  ShakyKnees.super_.call(this);
};

util.inherits(ShakyKnees, Festival);

ShakyKnees.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Shaky Knees', festivalDateId: 15, url: 'http://shakykneesfestival.com/artists/' }
  ];
};

ShakyKnees.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('.content-7').find('li').map(function(v,i) {
    return $(this).text().trim();
  }).get();
  this.generateInserts(fest);
};

module.exports = ShakyKnees;