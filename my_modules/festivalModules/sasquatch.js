var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Sasquatch = function() {
  Sasquatch.super_.call(this);
};

util.inherits(Sasquatch, Festival);

Sasquatch.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Sasquatch!', festivalDateId: 32, url: 'http://lineup.sasquatchfestival.com/' }
  ];
};

Sasquatch.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('.ds-level-override').map(function(v,i) {
    return $(this).find('.w').map(function(w,j){
      return $(this).find('img').attr('alt');
    }).get();
  }).get();
  this.generateInserts(fest);
};

module.exports = Sasquatch;