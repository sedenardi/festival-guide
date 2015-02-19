var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Ultra = function() {
  Festival.super_.call(this);
};

util.inherits(Ultra, Festival);

Ultra.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Ultra', festivalDateId: 49, url: 'http://www.jambase.com/Festivals/Festival.aspx?festivalId=11154' }
  ];
};

Ultra.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('#ctl00_MainContent_festivalLineup_lstLineup').find('li').map(function(v,i) {
    return $(this).text().replace('*','').trim()
  }).get();
  this.generateInserts(fest);
};

module.exports = Ultra;