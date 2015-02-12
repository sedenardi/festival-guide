var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var EauxClaires = function() {
  EauxClaires.super_.call(this);
};

util.inherits(EauxClaires, Festival);

EauxClaires.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Eaux Claires', festivalDateId: 35, url: 'http://eauxclaires.com/lineup/' }
  ];
};

EauxClaires.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('#row0').find('.col-sm-8').first()
    .find('.row').eq(1).find('p').map(function(){
      return $(this).text().trim();
    }).get();
  this.generateInserts(fest);
};

module.exports = EauxClaires;