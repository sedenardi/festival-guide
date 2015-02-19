var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Burgerama = function() {
  Festival.super_.call(this);
};

util.inherits(Burgerama, Festival);

Burgerama.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Burgerama', festivalDateId: 28, url: 'http://www.jambase.com/Festivals/Festival.aspx?festivalId=11051' }
  ];
};

Burgerama.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('#ctl00_MainContent_festivalLineup_lstLineup').find('li').map(function(v,i) {
    return $(this).text().replace('*','').trim()
  }).get();
  this.generateInserts(fest);
};

module.exports = Burgerama;