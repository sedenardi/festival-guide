var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Wayhome = function() {
  Festival.super_.call(this);
};

util.inherits(Wayhome, Festival);

Wayhome.prototype.getFestivalUrls = function() {
  return [
    { tag: 'WAYHOME', festivalDateId: 43, url: 'http://wayhome.com/' }
  ];
};

Wayhome.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('.holder').html().trim()
    .split('<strong>')[1].split('&amp; More</p>')[0]
    .replace('</strong>&#xA0;','/').split('/').map(function(v,i){
      return v.trim();
    });
  this.generateInserts(fest);
};

module.exports = Wayhome;