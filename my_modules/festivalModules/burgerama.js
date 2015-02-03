var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var Burgerama = function() {
  Burgerama.super_.call(this);
};

util.inherits(Burgerama, Festival);

Burgerama.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Burgerama', festivalDateId: 28, url: 'http://www.brooklynvegan.com/archives/2014/12/weezer_bone_thu.html' }
  ];
};

Burgerama.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);

  fest.artists = $('#more').find('p').eq(1).html()
    .split('</b><br>')[1].split('<br>').map(function(v,i) {
      return v.trim();
    });
  this.generateInserts(fest);
};

module.exports = Burgerama;