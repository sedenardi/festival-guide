var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var ElectricForest = function() {
  ElectricForest.super_.call(this);
};

util.inherits(ElectricForest, Festival);

ElectricForest.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Electric Forest', festivalDateId: 37, url: 'http://www.clickondetroit.com/entertainment/michigans-electric-forest-releases-2015-lineup/31229174' }
  ];
};

ElectricForest.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('.article-body').find('strong').map(function(v,i) {
    return $(this).text().trim();
  }).get();
  this.generateInserts(fest);
};

module.exports = ElectricForest;