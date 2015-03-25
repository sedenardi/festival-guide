var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Gasparilla = function() {
  Festival.super_.call(this);
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

  fest.artists = $('label').map(function(v,i) {
    return self.unCapitalize($(this).next('a').text().trim());
  }).get().filter(function(v,i) {
    return v.length && v !== 'undefined';
  });
  this.generateInserts(fest);
};

module.exports = Gasparilla;