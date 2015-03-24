var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Osheaga = function() {
  Festival.super_.call(this);
};

util.inherits(Osheaga, Festival);

Osheaga.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Osheaga', festivalDateId: 67, url: 'http://festivals.jambase.com/festival/osheaga' }
  ];
};

Osheaga.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = this.getFromJamBase($);
  this.generateInserts(fest);
};

module.exports = Osheaga;