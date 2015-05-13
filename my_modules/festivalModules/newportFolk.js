var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var NewportFolk = function() {
  Festival.super_.call(this);
};

util.inherits(NewportFolk, Festival);

NewportFolk.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Newport Folk', festivalDateId: 89, url: 'http://festivals.jambase.com/festival/newport-folk-festival' }
  ];
};

NewportFolk.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = this.getFromJamBase($);
  this.generateInserts(fest);
};

module.exports = NewportFolk;