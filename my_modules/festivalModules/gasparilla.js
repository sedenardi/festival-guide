var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Gasparilla = function() {
  Gasparilla.super_.call(this);
};

util.inherits(Gasparilla, Festival);

Gasparilla.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Gasparilla', festivalDateId: 29, url: 'http://gasparillamusic.com/2015-lineup/' }
  ];
};

Gasparilla.prototype.parseFestival = function(fest,data) {
  var self = this;
  var $ = cheerio.load(data);

  fest.artists = $('.entry-content').find('p').map(function(v,i) {
    return $(this).find('a').map(function(w,j){
      var artist = $(this).text().trim();
      return self.unCapitalize(artist);
    }).get();
  }).get();
  this.generateInserts(fest);
};

module.exports = Gasparilla;