var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var FieldTrip = function() {
  Festival.super_.call(this);
};

util.inherits(FieldTrip, Festival);

FieldTrip.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Field Trip', festivalDateId: 38, url: 'http://www.jambase.com/Festivals/Festival.aspx?festivalId=11296' }
  ];
};

FieldTrip.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = [];//this.getFromJamBase($);
  this.generateInserts(fest);
};

module.exports = FieldTrip;