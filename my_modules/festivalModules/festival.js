var util = require('util'),
    events = require('events'),
    logger = require('../logger.js'),
    config = require('../../config.json'),
    Downloader = require('../downloader.js'),
    DB = require('../db.js');

var Festival = function() { };

util.inherits(Festival, events.EventEmitter);

Festival.prototype.getFestivalUrls = function() {
  return [];
};

Festival.prototype.start = function() {
  var urls = this.getFestivalUrls();
  for (var i = 0; i < urls.length; i++) {
    this.fetchFestival(urls[i]);
  }
};

Festival.prototype.fetchFestival = function(fest) {
  logger.log({
    caller: 'Festival',
    message: 'starting',
    params: fest.tag
  });
  var self = this;
  var dl = new Downloader();
  dl.on('data', function(res) {
    self.parseFestival(fest,res);
  });
  dl.download(fest.url);
};

Festival.prototype.generateInserts = function(fest) {
  var artistInserts = [];
  var s = 'select ? as `artistReported`';
  var artistSelects = [];
  for (var i = 0; i < fest.artists.length; i++) {
    artistSelects.push(s);
    artistInserts.push(fest.artists[i]);
  }
  var artistTable = '(' + artistSelects.join(' UNION ') + ')';

  var inserts = [];
  var sql = 'insert into artistsReported(artistReported) select artistReported from ';
  sql += artistTable + ' t1 ' +
    'where not exists (select 1 from artistsReported t2 where t2.artistReported = t1.artistReported); ';
  inserts = inserts.concat(artistInserts);

  sql += 'insert into artists(artist) select artistReported from artistsReported t1 ' +
    'where t1.artistId is null and exists (select 1 from ' + artistTable + ' t2 where t2.artistReported = t1.artistReported); ';
  inserts = inserts.concat(artistInserts);

  sql += 'update artistsReported ar join artists a on a.artist = ar.artistReported ' +
    'set ar.artistId = a.artistId where ar.artistId is null ' +
    'and exists (select 1 from ' + artistTable + ' t2 where t2.artistReported = ar.artistReported); ';
  inserts = inserts.concat(artistInserts);

  sql += 'insert into appearances(artistId,festivalDateId) select ar.artistId, ? as `festivalDateId` ' +
    'from artistsReported ar where exists (select 1 from ' + artistTable + ' t2 where t2.artistReported = ar.artistReported) ' +
    'and not exists (select 1 from appearances ap where ap.artistId = ar.artistId and ap.festivalDateId = ?);';
  inserts.push(fest.festivalDateId);
  inserts = inserts.concat(artistInserts);
  inserts.push(fest.festivalDateId);

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