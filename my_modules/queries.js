var queries = function() {

  var self = this;

  this.getAllInfo = function() {
    var locations = self.getAllLocations();
    var festivals = self.getAllFestivals();
    var artists = self.getAllArtists();
    var festivalDates = self.getAllFestivalDates();
    var appearances = self.getAllAppearances();
    var chordData = self.getChordData();
    var sql = locations.cmd.sql +
      festivals.cmd.sql +
      artists.cmd.sql +
      festivalDates.cmd.sql +
      appearances.cmd.sql +
      chordData.cmd.sql;
    return {
      cmd: { sql: sql },
      process: function(dbRes) {
        var locObj = locations.process(dbRes[0]);
        var festObj = festivals.process(dbRes[1]);
        var artObj = artists.process(dbRes[2]);
        var festDateObj = festivalDates.process(dbRes[3]);
        var appObj = appearances.process(dbRes[4]);
        var chordObj = chordData.process(dbRes[5]);
        return {
          locations: locObj,
          festivals: festObj,
          artists: artObj,
          festivalDates: festDateObj,
          appearances: appObj,
          chordData: chordObj
        };
      }
    };
  };

  this.getAllLocations = function() {
    return {
      cmd: { sql: 'select * from locations;' },
      process: function(dbRes) {
        return dbRes.map(function(v,i){
          return [v.locationId,v.city,v.state,v.country,parseFloat(v.lat),parseFloat(v.lng)];
        });
      }
    };
  };

  this.getAllFestivals = function(orderBy) {
    return {
      cmd: { sql: 'select * from festivals;' },
      process: function(dbRes) {
        return dbRes.map(function(v,i){
          return [v.festivalId,v.festival,v.locationId,v.website];
        });
      }
    };
  };

  this.getAllArtists = function() {
    return {
      cmd: { sql: 'select * from artists;' },
      process: function(dbRes) {
        return dbRes.map(function(v,i){
          return [v.artistId,v.artist];
        });
      }
    };
  };

  this.getAllFestivalDates = function(orderBy) {
    return {
      cmd: { sql: 'select * from festivalDates;' },
      process: function(dbRes) {
        return dbRes.map(function(v,i){
          return [v.festivalDateId,v.festivalId,v.week,v.startDate,v.endDate];
        });
      }
    };
  };

  this.getAllAppearances = function() {
    return {
      cmd: { sql: 'select * from appearances;' },
      process: function(dbRes) {
        return dbRes.map(function(v,i){
          return [v.festivalDateId,v.artistId];
        });
      }
    };
  };

  this.getChordData = function() {
    var sql = '\
select \
 f1.festivalId as festivalId1 \
,f2.festivalId as festivalId2 \
,coalesce(c.count,0) as count \
from festivals f1 \
 cross join festivals f2 \
 left outer join \
  (select \
    a1.festivalId as festivalId1 \
  , a2.festivalId as festivalId2 \
  , count(1) as count \
  from (select distinct \
        artistId \
        ,festivalId \
        from appearances a \
         inner join festivalDates fd \
          on fd.festivalDateId = a.festivalDateId) a1 \
   inner join (select distinct \
               artistId \
               ,festivalId \
               from appearances a \
                inner join festivalDates fd \
                 on fd.festivalDateId = a.festivalDateId) a2 \
    on a2.artistId = a1.artistId \
  where a1.festivalId <> a2.festivalId \
  group by a1.festivalId,a2.festivalId) c \
  on c.festivalId1 = f1.festivalId \
  and c.festivalId2 = f2.festivalId \
where f1.festivalId <= f2.festivalId \
order by f1.festivalId,f2.festivalId;';
    return {
      cmd: { sql: sql },
      process: function(dbRes) {
        return dbRes.map(function(v,i){
          return [v.festivalId1,v.festivalId2,v.count];
        });
      }
    };
  };

};

module.exports = new queries();