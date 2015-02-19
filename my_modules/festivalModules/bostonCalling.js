var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var BostonCalling = function() {
  Festival.super_.call(this);
};

util.inherits(BostonCalling, Festival);

BostonCalling.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Boston Calling', festivalDateId: 46, url: 'http://www.jambase.com/Festivals/Festival.aspx?festivalId=11115' }
  ];
};

BostonCalling.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('#ctl00_MainContent_festivalLineup_lstLineup').find('li').map(function(v,i) {
    return $(this).text().replace('*','').trim()
  }).get();
  this.generateInserts(fest);
};

module.exports = BostonCalling;