var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var AllGood = function() {
  Festival.super_.call(this);
};

util.inherits(AllGood, Festival);

AllGood.prototype.getFestivalUrls = function() {
  return [
    { tag: 'All Good', festivalDateId: 58, url: 'http://www.jambase.com/Festivals/Festival.aspx?festivalId=10986' }
  ];
};

AllGood.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('#ctl00_MainContent_festivalLineup_lstLineup').find('li').map(function(v,i) {
    return $(this).text().replace('*','').trim()
  }).get();
  this.generateInserts(fest);
};

module.exports = AllGood;