var util = require('util'),
    Festival = require('./festival.js');

var MountainJam = function() {
  MountainJam.super_.call(this);
};

util.inherits(MountainJam, Festival);

MountainJam.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Mountain Jam', festivalDateId: 12, url: 'http://s3.amazonaws.com/goevent-web-mountainjam-2015/widgets/artists/widget_items_eng.json' }
  ];
};

MountainJam.prototype.parseFestival = function(fest,data) {
  var artists = JSON.parse(data);

  fest.artists = artists[0].headliner.map(function(v,i) {
    return artists[0].artists[v].title;
  });
  this.generateInserts(fest);
};

module.exports = MountainJam;