var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var CRSSD = function() {
  Festival.super_.call(this);
};

util.inherits(CRSSD, Festival);

CRSSD.prototype.getFestivalUrls = function() {
  return [
    { tag: 'CRSSD', festivalDateId: 60, url: 'http://www.jambase.com/Festivals/Festival.aspx?festivalId=11060' }
  ];
};

CRSSD.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('#ctl00_MainContent_festivalLineup_lstLineup').find('li').map(function(v,i) {
    return $(this).text().replace('*','').trim()
  }).get();
  this.generateInserts(fest);
};

module.exports = CRSSD;