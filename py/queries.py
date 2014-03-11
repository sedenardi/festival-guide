def getAllArtists():
  return 'select * from artists;'

def getArtistInfo(artistId):
  return ('Select '
    'ap.appearanceId, '
    'ap.setTime, '
    'fest.festivalId, '
    'fest.festival, '
    'fest.week, '
    'fest.location, '
    'fest.startDate, '
    'fest.endDate '
    'from appearances ap '
    '  inner join festivals fest '
    '    on fest.festivalId = ap.festivalId '
    'where ap.artistId = ' + str(artistId) + ' '
    'order by fest.startDate asc;')

def getFestivalsForArtist(artistId):
  return ('Select '
    'GROUP_CONCAT(ap.appearanceId separator \',\') as appearanceIds, '
    'GROUP_CONCAT(ap.setTime separator \',\') as setTimes, '
    'GROUP_CONCAT(fest.festivalId separator \',\') as festivalIds, '
    'fest.festival, '
    'GROUP_CONCAT(fest.week separator \',\') as weeks, '
    'GROUP_CONCAT(distinct fest.location separator \',\') as location, '
    'GROUP_CONCAT(fest.startDate separator \',\') as startDates, '
    'GROUP_CONCAT(fest.endDate separator \',\') as endDates '
    'from appearances ap '
      'inner join festivals fest '
        'on fest.festivalId = ap.festivalId '
    'where ap.artistId = ' + str(artistId) + ' '
    'group by festival '
    'order by startDate;')

  this.getUniqueFestivals = function() {
    return 'select * from festivals where festivalId <> 2;';
  };

  this.getFestival = function(festivalId) {
    return 'select * from festivals where festivalId = ' + festivalId + ';';
  };

  this.getFestivalInfo = function(festivalId) {
    return {
      festival: this.getFestival(festivalId),
      artists: this.getArtistsForFestival(festivalId)
    };
  };

  this.getAllFestivals = function(orderBy) {
    return 'select * from festivals ' + 
      (typeof orderBy !== 'undefined' ? 
        'order by ' + orderBy + ' asc' : '') + ';';
  };

  this.getArtistsForFestival = function(festivalId) {
    return 'select \
  ar.artistId, \
  ar.artist, \
  app.appearanceId, \
  app.setTime \
from artists ar \
  inner join appearances app \
    on app.artistId = ar.artistId \
where app.festivalId = ' + festivalId + 
' order by artist asc;';
  };

  this.getOrderedFestivals = function(festivalIds) {
    return 'Select \
              festivalId, \
              festival, \
              @curRow := @curRow + 1 AS idx \
            from festivals f \
            join (select @curRow := 0) r \
            where festivalId in (' + festivalIds + ') \
            order by festivalId asc;';
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
      sets: sets,
      overlaps: overlaps
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
    return query;
  };
};

module.exports = new queries();