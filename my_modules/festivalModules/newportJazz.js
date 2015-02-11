var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var NewportJazz = function() {
  NewportJazz.super_.call(this);
};

util.inherits(NewportJazz, Festival);

NewportJazz.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Newport Jazz', festivalDateId: 34, url: 'http://www.newportjazzfest.org/index.php?pID=17' }
  ];
};

NewportJazz.prototype.parseFestival = function(fest,data) {
  var self = this;
  var $ = cheerio.load(data);

  fest.artists = $('.artist').map(function(v,i) {
    return $(this).text().trim();
  }).get();
  this.generateInserts(fest);
};

module.exports = NewportJazz;