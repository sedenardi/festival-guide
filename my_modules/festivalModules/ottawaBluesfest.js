var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var OttawaBluesfest = function() {
  Festival.super_.call(this);
};

util.inherits(OttawaBluesfest, Festival);

OttawaBluesfest.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Ottawa Bluesfest', festivalDateId: 88, url: 'http://festivals.jambase.com/festival/ottawa-bluesfest' }
  ];
};

OttawaBluesfest.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = this.getFromJamBase($);
  this.generateInserts(fest);
};

module.exports = OttawaBluesfest;