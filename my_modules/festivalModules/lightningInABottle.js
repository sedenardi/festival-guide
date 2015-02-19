var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var LightningInABottle = function() {
  Festival.super_.call(this);
};

util.inherits(LightningInABottle, Festival);

LightningInABottle.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Lightning in a Bottle', festivalDateId: 36, url: 'http://www.jambase.com/Festivals/Festival.aspx?festivalId=11174' }
  ];
};

LightningInABottle.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('#ctl00_MainContent_festivalLineup_lstLineup').find('li').map(function(v,i) {
    return $(this).text().replace('*','').trim()
  }).get();
  this.generateInserts(fest);
};

module.exports = LightningInABottle;