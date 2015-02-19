var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var PotOfGold = function() {
  Festival.super_.call(this);
};

util.inherits(PotOfGold, Festival);

PotOfGold.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Pot Of Gold', festivalDateId: 61, url: 'http://www.jambase.com/Festivals/Festival.aspx?festivalId=11107' }
  ];
};

PotOfGold.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('#ctl00_MainContent_festivalLineup_lstLineup').find('li').map(function(v,i) {
    return $(this).text().replace('*','').trim()
  }).get();
  this.generateInserts(fest);
};

module.exports = PotOfGold;