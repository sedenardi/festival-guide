var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var GovBall = function() {
  Festival.super_.call(this);
};

util.inherits(GovBall, Festival);

GovBall.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Governor\'s Ball', festivalDateId: 4, url: 'http://lineup.governorsballmusicfestival.com/' }
  ];
};

GovBall.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('.ds-level-override').map(function(v,i) {
    return $(this).find('.w').map(function(w,j){
      return $(this).find('a').text().trim();
    }).get();
  }).get();
  this.generateInserts(fest);
};

module.exports = GovBall;