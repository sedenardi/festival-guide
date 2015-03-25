var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var FieldTrip = function() {
  Festival.super_.call(this);
};

util.inherits(FieldTrip, Festival);

FieldTrip.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Field Trip', festivalDateId: 38, url: 'http://consequenceofsound.net/festival/field-trip-music-arts-festival-2015/' }
  ];
};

FieldTrip.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('#festival-tab-lineup').find('.artist').map(function(v,i) {
    return $(this).text().trim();
  }).get();
  this.generateInserts(fest);
};

module.exports = FieldTrip;