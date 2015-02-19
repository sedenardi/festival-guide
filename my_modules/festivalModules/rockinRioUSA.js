var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var RockinRioUSA = function() {
  Festival.super_.call(this);
};

util.inherits(RockinRioUSA, Festival);

RockinRioUSA.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Rock in Rio USA', festivalDateId: 54, url: 'http://www.jambase.com/Festivals/Festival.aspx?festivalId=11011' },
    { tag: 'Rock in Rio USA', festivalDateId: 55, url: 'http://www.jambase.com/Festivals/Festival.aspx?festivalId=11012' }
  ];
};

RockinRioUSA.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('#ctl00_MainContent_festivalLineup_lstLineup').find('li').map(function(v,i) {
    return $(this).text().replace('*','').trim()
  }).get();
  this.generateInserts(fest);
};

module.exports = RockinRioUSA;