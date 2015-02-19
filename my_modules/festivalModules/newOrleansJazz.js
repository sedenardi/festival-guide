var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var NewOrleansJazz = function() {
  Festival.super_.call(this);
};

util.inherits(NewOrleansJazz, Festival);

NewOrleansJazz.prototype.getFestivalUrls = function() {
  return [
    { tag: 'New Orleans Jazz', festivalDateId: 6, url: 'http://lineup.nojazzfest.com/' }
  ];
};

NewOrleansJazz.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('.ds-level-override').map(function(v,i) {
    return $(this).find('.w').map(function(w,j){
      return $(this).find('a').text().trim();
    }).get();
  }).get();
  this.generateInserts(fest);
};

module.exports = NewOrleansJazz;