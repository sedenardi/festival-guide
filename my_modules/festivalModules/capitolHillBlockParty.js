var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var CapitolHillBlockParty = function() {
  Festival.super_.call(this);
};

util.inherits(CapitolHillBlockParty, Festival);

CapitolHillBlockParty.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Capitol Hill Block Party', festivalDateId: 79, url: 'http://festivals.jambase.com/festival/capitol-hill-block-party' }
  ];
};

CapitolHillBlockParty.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = this.getFromJamBase($);
  this.generateInserts(fest);
};

module.exports = CapitolHillBlockParty;