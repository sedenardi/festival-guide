var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var GatheringOfTheVibes = function() {
  Festival.super_.call(this);
};

util.inherits(GatheringOfTheVibes, Festival);

GatheringOfTheVibes.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Gathering Of The Vibes', festivalDateId: 75, url: 'http://festivals.jambase.com/festival/gathering-of-the-vibes' }
  ];
};

GatheringOfTheVibes.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = this.getFromJamBase($);
  this.generateInserts(fest);
};

module.exports = GatheringOfTheVibes;