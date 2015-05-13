var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Glastonbury = function() {
  Festival.super_.call(this);
};

util.inherits(Glastonbury, Festival);

Glastonbury.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Glastonbury', festivalDateId: 86, url: 'http://www.glastonburyfestivals.co.uk/line-up/' }
  ];
};

Glastonbury.prototype.parseFestival = function(fest,data) {
  var self = this;
  var $ = cheerio.load(data);

  fest.artists = $('.entry-content').find('p').eq(1).text().split('\n').map(function(v,i) {
    return self.unCapitalize(v);
  });
  this.generateInserts(fest);
};

module.exports = Glastonbury;