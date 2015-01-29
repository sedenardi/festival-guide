var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Coachella = function() {
  Coachella.super_.call(this);
};

util.inherits(Coachella, Festival);

Coachella.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Coachella Week 1', festivalDateId: 1, url: 'https://www.coachella.com/lineup/?weekend=1&sort=alpha' },
    { tag: 'Coachella Week 2', festivalDateId: 2, url: 'https://www.coachella.com/lineup/?weekend=2&sort=alpha' }
  ];
};

Coachella.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);
  fest.artists = $('.artist').map(function(i,v) {
    return $(this).find('h3').text().trim().replace('More ','');
  }).get();
  this.generateInserts(fest);
};

module.exports = Coachella;