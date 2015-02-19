var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var ThePeach = function() {
  Festival.super_.call(this);
};

util.inherits(ThePeach, Festival);

ThePeach.prototype.getFestivalUrls = function() {
  return [
    { tag: 'The Peach', festivalDateId: 48, url: 'http://www.jambase.com/Festivals/Festival.aspx?festivalId=11081' }
  ];
};

ThePeach.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('#ctl00_MainContent_festivalLineup_lstLineup').find('li').map(function(v,i) {
    return $(this).text().replace('*','').trim()
  }).get();
  this.generateInserts(fest);
};

module.exports = ThePeach;