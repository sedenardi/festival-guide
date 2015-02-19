var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Wanee = function() {
  Festival.super_.call(this);
};

util.inherits(Wanee, Festival);

Wanee.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Wanee', festivalDateId: 50, url: 'http://www.jambase.com/Festivals/Festival.aspx?festivalId=10939' }
  ];
};

Wanee.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('#ctl00_MainContent_festivalLineup_lstLineup').find('li').map(function(v,i) {
    return $(this).text().replace('*','').trim()
  }).get();
  this.generateInserts(fest);
};

module.exports = Wanee;