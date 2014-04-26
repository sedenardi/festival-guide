var queries = function() {

  this.getAllArtists = function() {
    return {
      sql: 'select * from artists order by artist asc;',
      inserts: []
    };
  };

  this.getArtistInfo = function(artistId) {
    return {
      sql: 'Select \
  ap.appearanceId, \
  ap.setTime, \
  fest.festivalId, \
  fest.festival, \
  fest.week, \
  fest.location, \
  fest.startDate, \
  fest.endDate \
from appearances ap \
  inner join festivals fest \
    on fest.festivalId = ap.festivalId \
where ap.artistId = ? \
order by fest.startDate asc;',
      inserts: [artistId]
    };
  };

  this.getFestivalsForArtist = function(artistId) {
    return {
      sql: 'Select \
  GROUP_CONCAT(ap.appearanceId separator \',\') as appearanceIds, \
  GROUP_CONCAT(ap.setTime separator \',\') as setTimes, \
  GROUP_CONCAT(fest.festivalId separator \',\') as festivalIds, \
  fest.festival, \
  GROUP_CONCAT(fest.week separator \',\') as weeks, \
  GROUP_CONCAT(distinct fest.location separator \',\') as location, \
  GROUP_CONCAT(fest.startDate separator \',\') as startDates, \
  GROUP_CONCAT(fest.endDate separator \',\') as endDates \
from appearances ap \
  inner join festivals fest \
    on fest.festivalId = ap.festivalId \
where ap.artistId = ? \
group by festival \
order by startDate;',
      inserts: [artistId]
    };
  };

  this.getUniqueFestivals = function() {
    return {
      sql: 'select * from festivals where festivalId <> 2;',
      inserts: []
    };
  };

  this.getFestival = function(festivalId) {
    return {
      sql: 'select * from festivals where festivalId = ?;',
      inserts: [festivalId]
    };
  };

  this.getFestivalInfo = function(festivalId) {
    var q1 = this.getFestival(festivalId);
    var q2 = this.getArtistsForFestival(festivalId);
    return {
      sql: q1.sql + q2.sql,
      inserts: q1.inserts.concat(q2.inserts)
    };
  };

  this.getAllFestivals = function(orderBy) {
    var q = 'select * from festivals ' + 
      (typeof orderBy !== 'undefined' ? 
        'order by ' + orderBy + ' asc' : '') + ';';
    return {
      sql: q,
      inserts: []
    };
  };

  this.getArtistsForFestival = function(festivalId) {
    return {
      sql: 'select \
  ar.artistId, \
  ar.artist, \
  app.appearanceId, \
  app.setTime \
from artists ar \
  inner join appearances app \
    on app.artistId = ar.artistId \
where app.festivalId = ? \
 order by artist asc;',
      inserts: [festivalId]
    };
  };

  this.getOrderedFestivals = function(festivalIds) {
    return {
      sql: 'Select \
              festivalId, \
              festival, \
              @curRow := @curRow + 1 AS idx \
            from festivals f \
              inner join (select @curRow := 0) r \
            where festivalId in (' + festivalIds + ') \
            order by festivalId asc;',
      inserts: []
    };
  };

  this.getOverlapsForFestivals = function(festivals) {
    var data = [];
    var base = '(select cast(count(1) as char(10)) from appearances a';
    var append = ' \n and exists (select 1 from appearances a2 \
      \n where a1.artistId = a2.artistId and a2.festivalId = ';

    var buildBase = function(festival) {
      return {
        sql: '(select cast(count(1) as char(10)) from appearances a' + festival.festivalId + 
          ' where festivalId = ' + festival.festivalId,
        fests: [festival]
      };
    };

    var appendBase = function(baseObj,festival) {
      var a = baseObj.fests.slice(0);
      a.push(festival);
      return {
        sql: baseObj.sql + ' \n and exists (select 1 from appearances a' +
          festival.festivalId + '  where a' + baseObj.fests[0].festivalId + 
          '.artistId = a' + festival.festivalId + '.artistId' +
          ' and a' + festival.festivalId + '.festivalId = ' + 
          festival.festivalId + ')',
        fests: a
      };
    }

    for (var i = 0; i < festivals.length; i++) {
      var d_length = data.length;
      for (var j = 0; j < d_length; j++) {
        data.push(appendBase(data[j],festivals[i]));
      }
      data.push(buildBase(festivals[i]));
    }

    var setBase = 'select CONCAT(\'[\',';
    var setArray = [];
    var overlapBase = 'select CONCAT(\'[\',';
    var overlapArray = [];
    for (var i = 0; i < data.length; i++) {
      if (data[i].fests.length > 1) {
        var tag = '[';
        var overlap = '';
        if (overlapArray.length > 0) {
          overlap += '),\'}, \',';
        }
        for (var j = 0; j < data[i].fests.length; j++) {
          tag += data[i].fests[j].idx - 1;
          if (j + 1 == data[i].fests.length) {
            tag += ']';  
          } else {
            tag += ','
          }
        }
        overlap += '\'{"sets": ' + tag + ', "size": \',' + data[i].sql;
        overlapArray.push(overlap);
      } else {
        var set = '';
        if (setArray.length > 0) {
          set += '),\'}, \',';
        }
        set += '\'{"label": "' + data[i].fests[0].festival.replace('\'','\\\'') + 
          '", "festivalId": "' + data[i].fests[0].festivalId + '", "size": \',' + data[i].sql;
        setArray.push(set);
      }
    }
    var sets = setBase + setArray.join('\n') + '),\'}]\') as sets;';
    var overlaps = overlapBase + overlapArray.join('\n') + '),\'}]\') as overlaps;';
    return {
      sql: sets + overlaps,
      inserts: []
    };
  };

  this.getInCommonForFestivals = function(festivalIds) {
    var festivals = festivalIds.split(',');
    var query = 'Select ar.* from artists ar';

    var appendBase = function(id,index) {
      return ' \n ' + (index === 0 ? 'where' : 'and') + 
        ' exists (select 1 from appearances a' + id + 
        ' \n  where ar.artistId = a' + id + '.artistId' +
        ' and a' + id + '.festivalId = ' + id + ')';
    }

    for (var i = 0; i < festivals.length; i++) {
      query += appendBase(festivals[i],i);
    }

    query += ' order by ar.artist;';
    return {
      sql: query,
      inserts: []
    };
  };

  this.getAllAppearances = function() {
    return {
      sql: 'select ap.* from appearances ap \
        inner join festivals f \
          on f.festivalId = ap.festivalId \
      order by ap.artistId asc, f.startDate asc;',
      inserts: []
    };
  };

  this.getAllLocations = function() {
    return {
      sql: 'select * from locations order by locationId;',
      inserts: []
    };
  };

};

module.exports = new queries();