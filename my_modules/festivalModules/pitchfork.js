var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Pitchfork = function() {
  Festival.super_.call(this);
};

util.inherits(Pitchfork, Festival);

Pitchfork.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Pitchfork', festivalDateId: 42, url: 'http://www.pitchforkmusicfestival.com/' }
  ];
};

Pitchfork.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('.container').find('.artist').map(function(v,i){
    return $(this).text().trim();
  }).get();
  this.generateInserts(fest);
};

module.exports = Pitchfork;