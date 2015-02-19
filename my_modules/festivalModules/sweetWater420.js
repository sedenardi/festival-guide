var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var SweetWater420 = function() {
  Festival.super_.call(this);
};

util.inherits(SweetWater420, Festival);

SweetWater420.prototype.getFestivalUrls = function() {
  return [
    { tag: 'SweetWater 420', festivalDateId: 45, url: 'http://www.jambase.com/Festivals/Festival.aspx?festivalId=10975' }
  ];
};

SweetWater420.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('#ctl00_MainContent_festivalLineup_lstLineup').find('li').map(function(v,i) {
    return $(this).text().replace('*','').trim()
  }).get();
  this.generateInserts(fest);
};

module.exports = SweetWater420;