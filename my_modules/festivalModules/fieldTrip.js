var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var FieldTrip = function() {
  FieldTrip.super_.call(this);
};

util.inherits(FieldTrip, Festival);

FieldTrip.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Field Trip', festivalDateId: 38, url: 'http://www.brooklynvegan.com/archives/2015/02/torontos_field.html' }
  ];
};

FieldTrip.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('#more').find('p').eq(2).html()
    .split('</strong>')[1].split('<br>').map(function(v,i) {
      return v.trim().replace('&amp;','&');
    }).filter(function(v,i) {
      return v.length;
    });
  this.generateInserts(fest);
};

module.exports = FieldTrip;