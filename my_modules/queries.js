var queries = function() {

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
          festival.festivalId + ' \n  where a' + baseObj.fests[0].festivalId + 
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
          tag += data[i].fests[j].idx;
          if (j + 1 == data[i].fests.length) {
            tag += ']';  
          } else {
            tag += ','
          }
        }
        overlap += '\'{sets: ' + tag + ', size: \',' + data[i].sql;
        overlapArray.push(overlap);
      } else {
        var set = '';
        if (setArray.length > 0) {
          set += '),\'}, \',';
        }
        set += '\'{label: "' + data[i].fests[0].festival.replace('\'','\\\'') + 
          '", size: \',' + data[i].sql;
        setArray.push(set);
      }
    }
    var sets = setBase + setArray.join('\n') + '),\'}]\') as sets;';
    var overlaps = overlapBase + overlapArray.join('\n') + '),\'}]\') as overlaps;';
    return {
      sets: sets,
      overlaps: overlaps
    };
  }
};

module.exports = new queries();