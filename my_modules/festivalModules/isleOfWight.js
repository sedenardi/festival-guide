var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var IsleOfWight = function() {
  Festival.super_.call(this);
};

util.inherits(IsleOfWight, Festival);

IsleOfWight.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Isle Of Wight', festivalDateId: 85, url: 'http://isleofwightfestival.com/line-up-list.aspx' }
  ];
};

IsleOfWight.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('[class*="column"]').map(function() {
    return $(this).find('p').map(function() {
      return $(this).text().trim();
    }).get();
  }).get().filter(function(v,i) {
    return v !== 'Special Guest';
  });
  this.generateInserts(fest);
};

module.exports = IsleOfWight;