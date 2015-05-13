var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var CampBisco = function() {
  Festival.super_.call(this);
};

util.inherits(CampBisco, Festival);

CampBisco.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Camp Bisco', festivalDateId: 90, url: 'http://festivals.jambase.com/festival/camp-bisco' }
  ];
};

CampBisco.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = this.getFromJamBase($);
  this.generateInserts(fest);
};

module.exports = CampBisco;