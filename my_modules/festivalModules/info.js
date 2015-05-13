var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Info = function() {
  Festival.super_.call(this);
};

util.inherits(Info, Festival);

Info.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Info', festivalDateId: 81, url: 'http://festivals.jambase.com/festival/le-festival-dete-de-quebec' }
  ];
};

Info.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = this.getFromJamBase($);
  this.generateInserts(fest);
};

module.exports = Info;