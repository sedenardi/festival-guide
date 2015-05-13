var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var FPSF = function() {
  Festival.super_.call(this);
};

util.inherits(FPSF, Festival);

FPSF.prototype.getFestivalUrls = function() {
  return [
    { tag: 'FPSF', festivalDateId: 80, url: 'http://s3.amazonaws.com/goevent-web-freepresssummerfestival-2015/widgets/artists/widget_items_eng.json', json: true }
  ];
};

FPSF.prototype.parseFestival = function(fest,data) {
  var artistObj = data[0].artists;
  fest.artists = [];
  for (var a in artistObj) {
    fest.artists.push(artistObj[a].title);
  }
  this.generateInserts(fest);
};

module.exports = FPSF;