var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var BealeStreet = function() {
  Festival.super_.call(this);
};

util.inherits(BealeStreet, Festival);

BealeStreet.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Beale Street Music Festival', festivalDateId: 73, url: 'http://www.memphisinmay.org/bsmf-lineup' }
  ];
};

BealeStreet.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('.sw-portfolio-projects-list').find('li').map(function() {
    return $(this).find('.sw-portfolio-project-thumbnail-link').attr('title');
  }).get();
  this.generateInserts(fest);
};

module.exports = BealeStreet;