var util = require('util'),
    Festival = require('./festival.js'),
    cheerio = require('cheerio');

var NXNE = function() {
  Festival.super_.call(this);
};

util.inherits(NXNE, Festival);

NXNE.prototype.getFestivalUrls = function() {
  return [
    { tag: 'NXNE', festivalDateId: 62, url: 'http://s3.amazonaws.com/goevent-web-northbynortheast-2015/widgets/artists/widget_items_401_eng.json', json: true }
  ];
};

NXNE.prototype.parseFestival = function(fest,data) {
  var artistObj = data[0].artists;
  fest.artists = [];
  for (var a in artistObj) {
    fest.artists.push(artistObj[a].title);
  }
  this.generateInserts(fest);
};

module.exports = NXNE;