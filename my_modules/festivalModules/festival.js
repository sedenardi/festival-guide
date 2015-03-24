var util = require('util'),
    events = require('events'),
    logger = require('../logger.js'),
    config = require('../../config.json'),
    Downloader = require('../downloader.js'),
    DB = require('../db.js');

var Festival = function() {
  this.debug = false;
};

util.inherits(Festival, events.EventEmitter);

Festival.prototype.getFestivalUrls = function() {
  return [];
};

Festival.prototype.start = function(debug) {
  var self = this;
  if (typeof debug !== 'undefined')
    this.debug = debug;
  var urls = this.getFestivalUrls();
  urls.forEach(function(v,i) {
    self.fetchFestival(v);
  });
};

Festival.prototype.fetchFestival = function(fest) {
  logger.log({
    caller: 'Festival',
    message: 'starting',
    params: fest.tag,
    minData: fest.tag
  });
  var self = this;
  var dl = new Downloader();
  dl.on('data', function(res) {
    self.parseFestival(fest,res);
  });
  dl.download(fest.url, fest.json);
};

Festival.prototype.unCapitalize = function(artist) {
  return artist.split(' ').map(function(x,k){
    return x[0] + x.slice(1,x.length).toLowerCase();
  }).join(' ');
};

Festival.prototype.capitalize = function(artist) {
  return artist.split(' ').map(function(x,k){
    return x[0].toUpperCase() + x.slice(1,x.length);
  }).join(' ');
};

Festival.prototype.replaceWhitespace = function(artist) {
  return artist.replace(/\s{2,}/g, ' ');
};

Festival.prototype.getFromJamBase = function($) {
  return $('.performances').map(function(v,i) {
    return $(this).find('a').text().trim();
  }).get().filter(function(v,i) {
    return v.length;
  });
};

Festival.prototype.generateInserts = function(fest) {
  if (this.debug) {
    logger.log({
      caller: 'Festival',
      message: 'debug',
      params: fest,
      minData: fest.tag
    });
    console.log(JSON.stringify(fest));
    this.emit('done', fest.tag);
    return;
  }

  if (!fest.artists.length) {
    this.insertAppearances(fest.tag, { sql: 'select 1;' });
    return;
  }

  var artistTable = '(' + Array.apply(null,new Array(fest.artists.length)).map(function(){
    return 'select ? as `artistReported`';
  }).join(' UNION ') + ')';

  var inserts = [];
  var sql = 'insert into artistsReported(artistReported) select artistReported from ';
  sql += artistTable + ' t1 ' +
    'where not exists (select 1 from artistsReported t2 where t2.artistReported = t1.artistReported); ';
  inserts = inserts.concat(fest.artists);

  sql += 'insert into artists(artist) select artistReported from artistsReported t1 ' +
    'where t1.artistId is null and exists (select 1 from ' + artistTable + ' t2 where t2.artistReported = t1.artistReported); ';
  inserts = inserts.concat(fest.artists);

  sql += 'update artistsReported ar join artists a on a.artist = ar.artistReported ' +
    'set ar.artistId = a.artistId where ar.artistId is null ' +
    'and exists (select 1 from ' + artistTable + ' t2 where t2.artistReported = ar.artistReported); ';
  inserts = inserts.concat(fest.artists);

  sql += 'insert into appearances(artistId,festivalDateId) select ar.artistId, ? as `festivalDateId` ' +
    'from artistsReported ar where exists (select 1 from ' + artistTable + ' t2 where t2.artistReported = ar.artistReported) ' +
    'and not exists (select 1 from appearances ap where ap.artistId = ar.artistId and ap.festivalDateId = ?); ';
  inserts.push(fest.festivalDateId);
  inserts = inserts.concat(fest.artists);
  inserts.push(fest.festivalDateId);

  sql += 'delete ap from appearances ap where ap.festivalDateId = ? and not exists ' +
    '(select 1 from artistsReported t1 inner join ' + artistTable + ' t2 on t2.artistReported = t1.artistReported ' +
    'where t1.artistId = ap.artistId);';
  inserts.push(fest.festivalDateId);  
  inserts = inserts.concat(fest.artists);

  this.insertAppearances(fest.tag, { sql: sql, inserts: inserts });
};

Festival.prototype.insertAppearances = function(tag,cmd) {
  var self = this;
  var db = new DB(config);
  db.connect(tag, function() {
    db.query(cmd, function() {
      db.disconnect(function() {
        self.emit('done', tag);
      });
    });
  });
};

module.exports = Festival;