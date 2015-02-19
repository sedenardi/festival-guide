var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Aura = function() {
  Festival.super_.call(this);
};

util.inherits(Aura, Festival);

Aura.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Aura', festivalDateId: 47, url: 'http://www.jambase.com/Festivals/Festival.aspx?festivalId=10701' }
  ];
};

Aura.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('#ctl00_MainContent_festivalLineup_lstLineup').find('li').map(function(v,i) {
    return $(this).text().replace('*','').trim()
  }).get();
  this.generateInserts(fest);
};

module.exports = Aura;