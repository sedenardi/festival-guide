var util = require('util'),
    Festival = require('./festival.js');

var Treefort = function() {
  Festival.super_.call(this);
};

util.inherits(Treefort, Festival);

Treefort.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Treefort Music Fest', festivalDateId: 20, url: 'http://treefortservices.azurewebsites.net/api/artists', json: true }
  ];
};

Treefort.prototype.parseFestival = function(fest,data) {
  var artists = data;

  fest.artists = artists.map(function(v,i) {
    return v.Name;
  });
  this.generateInserts(fest);
};

module.exports = Treefort;