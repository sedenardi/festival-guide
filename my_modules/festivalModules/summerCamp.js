var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var SummerCamp = function() {
  Festival.super_.call(this);
};

util.inherits(SummerCamp, Festival);

SummerCamp.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Summer Camp', festivalDateId: 33, url: 'http://summercampfestival.com/lineup/' }
  ];
};

SummerCamp.prototype.parseFestival = function(fest,data) {
  var self = this;
  var $ = cheerio.load(data);

  fest.artists = $('#main').find('a').map(function(v,i) {
    var artist = $(this).attr('title');
    if (!artist) {
      artist = $(this).attr('href').split('/')[4].replace(/-/g,' ');
      artist = self.capitalize(artist);
    }
    return artist;
  }).get();
  this.generateInserts(fest);
};

module.exports = SummerCamp;