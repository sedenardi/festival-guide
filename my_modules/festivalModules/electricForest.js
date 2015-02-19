var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var ElectricForest = function() {
  Festival.super_.call(this);
};

util.inherits(ElectricForest, Festival);

ElectricForest.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Electric Forest', festivalDateId: 37, url: 'http://www.jambase.com/Festivals/Festival.aspx?festivalId=11043' }
  ];
};

ElectricForest.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('#ctl00_MainContent_festivalLineup_lstLineup').find('li').map(function(v,i) {
    return $(this).text().replace('*','').trim()
  }).get();
  this.generateInserts(fest);
};

module.exports = ElectricForest;