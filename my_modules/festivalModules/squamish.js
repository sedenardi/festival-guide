var util = require('util'),
    Festival = require('./festival.js');

var Squamish = function() {
  Festival.super_.call(this);
};

util.inherits(Squamish, Festival);

Squamish.prototype.getFestivalUrls = function() {
  return [
    { tag: 'Squamish', festivalDateId: 72, url: 'http://squamish2015.app.eventbase.com/api/web/event-type/category?id=480312947&items_count=-1', json: true }
  ];
};

Squamish.prototype.parseFestival = function(fest,data) {
  var artists = data.items;

  fest.artists = artists.map(function(v,i) {
    return v.title;
  });
  this.generateInserts(fest);
};

module.exports = Squamish;