var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var ATPIceland = function() {
  Festival.super_.call(this);
};

util.inherits(ATPIceland, Festival);

ATPIceland.prototype.getFestivalUrls = function() {
  return [
    { tag: 'ATP Iceland', festivalDateId: 57, url: 'https://www.atpfestival.com/events/atpiceland2015/lineup' }
  ];
};

ATPIceland.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('.simpleLinkList').find('li').map(function(){
    return $(this).text().trim();
  }).get();
  this.generateInserts(fest);
};

module.exports = ATPIceland;