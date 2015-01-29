var util = require('util'),
    events = require('events'),
    logger = require('../logger.js'),
    config = require('../../config.json'),
    Downloader = require('../downloader.js'),
    cheerio = require('cheerio'),
    DB = require('../db.js');

var Coachella = function() {
  this.urls = [
    { tag: 'Coachella Week 1', festivalDateId: 1, url: 'https://www.coachella.com/lineup/?weekend=1&sort=alpha' },
    { tag: 'Coachella Week 2', festivalDateId: 2, url: 'https://www.coachella.com/lineup/?weekend=2&sort=alpha' }
  ];
};

util.inherits(Coachella, events.EventEmitter);

Coachella.prototype.start = function() {
  for (var i = 0; i < this.urls.length; i++) {
    this.fetchFestival(this.urls[i]);
  }
};

Coachella.prototype.fetchFestival = function(fest) {
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

Coachella.prototype.parseFestival = function(fest,data) {
  var $ = cheerio.load(data);
  fest.artists = [];
  $('.artist').each(function(i,v) {
    var artist = $(this).find('h3').text().trim().replace('More ','');
    fest.artists.push(artist);
  });
  this.generateInserts(fest);
};

Coachella.prototype.generateInserts = function(fest) {
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

Coachella.prototype.insertAppearances = function(tag,cmd) {
  var self = this;
  var db = new DB(config);
  db.connect(tag, function() {
    db.query(cmd, function() {
      db.disconnect(function() {
        self.emit('done', tag);
      });      
    });
  });
}

module.exports = Coachella;