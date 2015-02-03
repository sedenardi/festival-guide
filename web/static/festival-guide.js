d3.selection.prototype.moveParentToFront = function() {
  return this.each(function(){
    this.parentNode.parentNode.appendChild(this.parentNode);
  });
};

var festivalJSON, artistJSON, appearanceJSON,
    locationJSON, chordJSON, artistAuto = [], festivalArray = [];
$(document).ready(function() {
  $.ajax({
    url: './artists.json',
    cache: true,
    success: function(data) {
      artistJSON = data;
      for (var key in artistJSON) {
        artistAuto.push(artistJSON[key]);
      }
      artistAuto.sort(function(a,b) {
        return a.artist.toUpperCase().localeCompare(b.artist.toUpperCase());
      });
      finishLoading();
    }
  });
  $.ajax({
    url: './festivals.json',
    cache: true,
    success: function(data) {
      festivalJSON = data;
      for (var key in festivalJSON) {
        festivalArray.push(festivalJSON[key]);
      }
      festivalArray.sort(function(a,b){
        return a.festival.toUpperCase().localeCompare(
          b.festival.toUpperCase());
      });
      finishLoading();
    }
  });
  $.ajax({
    url: './appearances.json',
    cache: true,
    success: function(data) {
      appearanceJSON = data;
      finishLoading();
    }
  });
  $.ajax({
    url: './locations.json',
    cache: true,
    success: function(data) {
      locationJSON = data;
      finishLoading();
    }
  });
  $.ajax({
    url: './chordData.json',
    cache: true,
    success: function(data) {
      chordJSON = {};
      data.forEach(function(v,i) {
        var f1 = 'f' + v.festivalId1;
        var f2 = 'f' + v.festivalId2;
        if (typeof chordJSON[f1] === 'undefined')
          chordJSON[f1] = {};
        chordJSON[f1][f2] = v.count;
      });
      finishLoading();
    }
  });
  registerHelpers();
  $('.navbar-collapse ul li a').click(function(){
    $('.navbar-toggle:visible').click();
  });

  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    var feature = $(e.target).attr('href').split('#')[1];
    window.location.hash = '#' + feature;
    refreshMaps(feature);
  });

  $('.aboutModal').click(function(e) {
    $('#aboutModal').modal('show');
    e.preventDefault();
  });
});

var finishLoading = function() {
  if (typeof artistJSON !== 'undefined' &&
    typeof festivalJSON !== 'undefined' &&
    typeof appearanceJSON !== 'undefined' &&
    typeof locationJSON !== 'undefined' &&
    typeof chordJSON !== 'undefined') {
    loadArtistTab();
    loadFestivalListTab();
    loadFestivalMapTab();
    loadVennTab();
    loadChordTab();
    loadSuggestTab();
    loadWCSuggestTab();
    var url = document.location.toString();
    if (url.match('#')) {
      var feature = url.split('#')[1];
      $('.navbar-nav a[href=#' + feature + ']').tab('show');
    }
  }
};

var registerHelpers = function() {
  Handlebars.registerHelper('json', function(obj) {
    return JSON.stringify(obj, null, 2);
  });
  Handlebars.registerHelper('prettyDateRange', function(obj) {
    return moment(obj.startDate).format('dddd, MMMM Do') +
      ' to ' + moment(obj.endDate).format('dddd, MMMM Do');
  });
  Handlebars.registerHelper('simpleDateRange', function(obj) {
    return moment(obj.startDate).format('M/D') +
      ' to ' + moment(obj.endDate).format('M/D');
  });
  Handlebars.registerHelper('festivalWithWeek', function(obj) {
    return obj.festival + (obj.week !== null ? ' (Week ' + obj.week + ')' : '');
  });
  Handlebars.registerHelper('festivalWithDates', function(obj) {
    return obj.festival + ' ' +
      moment(obj.startDate).format('M/D') + '-' +
      moment(obj.endDate).format('M/D');
  });
  Handlebars.registerHelper('festivalWithLocationAndDates', function(obj) {
    var parts = obj.location.split(',');
    var location = parts.length > 1 ? parts[1].trim() : parts[0];
    return obj.festival + ' - ' + location + ' - ' +
      moment(obj.startDate).format('M/D') + '-' +
      moment(obj.endDate).format('M/D');
  });
  Handlebars.registerHelper('location', function(obj) {
    return locationJSON[obj.locationId].location;
  });
  Handlebars.registerHelper('joinArtists', function(obj) {
    return obj.map(function(v,i) {
      return v.artist;
    }).join(', ');
  });

  Handlebars.registerPartial('appearance', $('#appearance-partial').html());
  Handlebars.registerPartial('artist', $('#artist-partial').html());
};

var refreshMaps = function(feature) {
  if (feature === 'artists') {
    setTimeout(function() {
      google.maps.event.trigger(artistMap, 'resize');
      artistMap.setCenter(artistMapCenter);
    }, 300);
  } else if (feature === 'festival-map') {
    setTimeout(function() {
      google.maps.event.trigger(festivalMap, 'resize');
      festivalMap.setCenter(festivalMapCenter);
    }, 300);
  }
};

var geocoder = new google.maps.Geocoder,
  infowindow = new google.maps.InfoWindow(),
  artistMap,
  mapMarkers = [],
  directionsDisplay,
  directionsService,
  artistReq = null,
  currentArtist = 0,
  artistMapCenter;

var loadArtistTab = function() {
  var artists = new Bloodhound({
    datumTokenizer: function(d) {
      return Bloodhound.tokenizers.whitespace(d.artist);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    limit: 10,
    local: artistAuto
  });
   
  artists.initialize();

  $('#artistInput').typeahead(null, {
    name: 'artists',
    displayKey: 'artist',
    source: artists.ttAdapter(),
    templates: {
      suggestion: function(d) {
        return '<p class="artistName">' + d.artist + '</p>';
      }
    }
  }).bind('typeahead:selected', function (obj, datum){
    if (currentArtist !== datum.artistId) {
      currentArtist = datum.artistId;
      if (artistReq !== null) {
        artistReq.abort();
      }
      var fests = [];
      appearanceJSON.byArtist[datum.artistId].forEach(function(v,i) {
        var pushed = false;
        var f = festivalJSON[v];
        fests.forEach(function(w,j) {
          if (w.festival === f.festival) {
            w.startDates.push(f.startDate);
            w.endDates.push(f.endDate);
            w.festivalIds.push(f.festivalId);
            pushed = true;
          }
        });
        if (!pushed) {
          fests.push({
            festivalId: f.festivalId,
            festival: f.festival,
            week: f.week,
            location: locationJSON[f.locationId],
            startDates: [f.startDate],
            endDates: [f.endDate],
            festivalIds: [f.festivalId]
          });
        }
      });
      clearMarkers();
      if (fests.length > 1 && fests.length <= 10) {
        plotFestivals(fests);
      } else {
        fests.forEach(function(v,i) {
          pinFestival(v);
        });
      }
    }
    $('#artistInput').blur();
  });

  var height = $(window).height() - 10 - 43 - 39 - 34 - 32 - 10;
  var width = $(window).width() - 10 - 10;
  $('#artist-map-canvas').css('height',height);
  $('#artistInput').css('width',width);

  geocoder.geocode( { 'address': 'United States of America'}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      artistMapCenter = results[0].geometry.location;
      var myOptions = getMapOptions(results[0].geometry.location);
      artistMap = new google.maps.Map($('#artist-map-canvas')[0], myOptions);
    } else {
      alert('Google Maps error: ' + status);
    }
  });

  directionsDisplay = new google.maps.DirectionsRenderer();
  directionsDisplay.setOptions({
    draggable: false,
    suppressInfoWindows: false,
    suppressMarkers: true
  });
  directionsService = new google.maps.DirectionsService();
};

var getMapOptions = function(center) {
  var zoom = $(window).width() < 640 ? 3 : 4;
  return {
    zoom: zoom,
    maxZoom: 10,
    minZoom: 3,
    center: center,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    disableDefaultUI: false,
    scrollwheel: true,
    draggable: true,
    navigationControl: true,
    mapTypeControl: false,
    scaleControl: true,
    disableDoubleClickZoom: false
  };
};

var pinFestival = function(festival) {
  dropMarker(artistMap, festival.location, festival);
};

var clearMarkers = function() {
  mapMarkers.forEach(function(v,i) {
    v.setMap(null);
  });
  mapMarkers.length = 0;
  directionsDisplay.setMap(null);
};

var dropMarker = function(map, location, festival, markerImg) {
  var marker = new google.maps.Marker({
    position: location,
    map: map,
    icon: markerImg
  });
  google.maps.event.addListener(marker, 'click', (function(marker) {
    return function() {
      infowindow.setContent(artistMapInfoWindowContent(festival));
      infowindow.open(map, marker);
      wireupFestivalMapPopover();
    };
  })(marker));
  mapMarkers.push(marker);
};

var artistMapInfoWindowContent = function(festival) {
  var dateString = festival.startDates.map(function(v,i){
    return '<span class="festivalMapPopoverFest" data-festivalid="' +
      festival.festivalIds[i] + '">' + moment(v).format('dddd, MMMM Do') +
      ' to ' + moment(festival.endDates[i]).format('dddd, MMMM Do') + '</span>';
  }).join('<br>');

  return festival.festival + '<br>' +
    festival.location.location + '<br>' +
    dateString;
};

var plotFestivals = function(festivals) {
  var waypts = festivals.map(function(v,i){
    return { location: v.location.location, stopover: true };
  });

  var request = {
    origin: festivals[0].location.location,
    destination: festivals[festivals.length - 1].location.location,
    waypoints: waypts.slice(1,waypts.length-2),
    travelMode: google.maps.TravelMode.DRIVING
  };
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
      directionsDisplay.setMap(artistMap);
      dropDirectionMarkers(response.routes[0].legs, festivals);
    } else {
      alert('Google Maps error: ' + status);
    }
  });
};

var dropDirectionMarkers = function(route, festivals) {
  route.forEach(function(v,i){
    var markerImg = './images/marker' + (i + 1) + '.png';
    dropMarker(artistMap, v.start_location, festivals[i], markerImg);
  });
  var endMarkerImg = './images/marker' + (route.length + 1) + '.png';
  dropMarker(artistMap, route[route.length - 1].end_location, festivals[route.length], endMarkerImg);
};

var getFestivalWithLocation = function(festivalId) {
  return {
    festivalId: festivalJSON[festivalId].festivalId,
    festival: festivalJSON[festivalId].festival,
    week: festivalJSON[festivalId].week,
    location: locationJSON[festivalJSON[festivalId].locationId].location,
    startDate: festivalJSON[festivalId].startDate,
    endDate: festivalJSON[festivalId].endDate
  };
};

var currentFestival;
var loadFestivalListTab = function() {
  var o = {};
  o.festivals = [];
  for (var key in festivalJSON) {
    o.festivals.push(getFestivalWithLocation(key));
  }
  o.festivals.sort(function(a,b){
    return moment(a.startDate).valueOf() - moment(b.startDate).valueOf();
  });
  var nav = Handlebars.compile($('#festivalNav-template').html());
  $('#festivalListNav').html(nav(o));
  $('#festivalSelect').css('width','100%');
  $('#festivalSelect').select2({
    placeholder: 'Select a festival'
  }).on('change', function(e) {
    if (e.val !== currentFestival) {
      currentFestival = e.val;
      fetchFestivalInfo(currentFestival);
    }
  });
};

var fetchFestivalInfo = function (festivalId) {
  var o = {};
  o.festival = festivalJSON[festivalId];
  o.artists = [];
  var sortedArtistIds = getSortedArtists(festivalId);
  sortedArtistIds.forEach(function(v,i) {
    if (i%3 === 0) {
      var a = [artistJSON[v]];
      if (sortedArtistIds.length > (i+1)) {
        a.push(artistJSON[sortedArtistIds[i+1]]);
      }
      if (sortedArtistIds.length > (i+2)) {
        a.push(artistJSON[sortedArtistIds[i+2]]);
      }
      o.artists.push(a);
    }
  });
  var info = Handlebars.compile($('#festivalInfo-template').html());
  $('#festivalListInfo').html(info(o));
  wireupArtistPopover();
};

var getSortedArtists = function (festivalId) {
  var artistIds = appearanceJSON.byFestival[festivalId];
  artistIds.sort(function(a,b) {
    return artistJSON[a].artist.toUpperCase().localeCompare(
      artistJSON[b].artist.toUpperCase());
  });
  return artistIds;
};

var wireupArtistPopover = function() {
  var isTouchDevice = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
  $('.artistName').popover({
    placement: 'bottom',
    trigger: isTouchDevice ? 'click' : 'hover',
    html: true,
    content: function() {
      var artistId = $(this).attr('data-artist-id');
      var o = {};
      o.info = [];
      appearanceJSON.byArtist[artistId].forEach(function(v,i) {
        o.info.push(getFestivalWithLocation(v));
      });
      var pop = Handlebars.compile($('#artistPopover-template').html());
      return pop(o);
    }
  });
};

var festivalMap, festivalMapCenter;
var loadFestivalMapTab = function() {
  var height = $(window).height() - 50 - 53 - 10;
  $('#festival-map-canvas').css('height',height);
  geocoder.geocode( { 'address': 'United States of America'}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      festivalMapCenter = results[0].geometry.location;
      var myOptions = getMapOptions(results[0].geometry.location);
      festivalMap = new google.maps.Map($('#festival-map-canvas')[0], myOptions);
      plotAllFestivals();
    } else {
      alert('Google Maps error: ' + status);
    }
  });
};

var plotAllFestivals = function() {
  var locations = {};
  for (var key in locationJSON) {
    locations[key] = {
      locationId: locationJSON[key].locationId,
      location: locationJSON[key].location,
      lat: locationJSON[key].lat,
      lng: locationJSON[key].lng,
      festivals: []
    };
  }
  for (var fest in festivalJSON) {
    locations[festivalJSON[fest].locationId].festivals.push({
      festivalId: festivalJSON[fest].festivalId,
      festival: festivalJSON[fest].festival,
      week: festivalJSON[fest].week,
      startDate: festivalJSON[fest].startDate,
      endDate: festivalJSON[fest].endDate
    });
  }
  for (var loc in locations) {
    dropLocationMarker(festivalMap, locations[loc]);
  }
};

var dropLocationMarker = function(map, location) {
  var marker = new google.maps.Marker({
    position: location,
    map: map
  });
  google.maps.event.addListener(marker, 'click', (function(marker) {
    return function() {
      infowindow.setContent(festivalMapInfoWindowContent(location));
      infowindow.open(map, marker);
      infowindow.close();
      setTimeout(function (){
        infowindow.open(map, marker);
        wireupFestivalMapPopover();
      }, 1);
    };
  })(marker));
};

var festivalMapInfoWindowContent = function(location) {
  var popup = '<div class=festivalMapLocation>' + location.location + '</div>';
  popup += '<ul class="festivalMapList">';
  var formatted = location.festivals.map(function(v,i) {
    return '<li><span class="festivalMapPopoverFest" data-festivalId="' +
      v.festivalId + '">' + v.festival + ' ' +
      moment(v.startDate).format('M/D') + '-' +
      moment(v.endDate).format('M/D') + '</span></li>';
  });
  return popup + formatted.join('') + '</ul>';
};

var wireupFestivalMapPopover = function() {
  $('.festivalMapPopoverFest').unbind('click');
  $('.festivalMapPopoverFest').bind('click', function() {
    var festivalId = $(this).attr('data-festivalId');
    loadFestivalListTabWithFestival(festivalId);
  });
};

var loadFestivalListTabWithFestival = function(festivalId) {
  $('.navbar-nav a[href=#festival-list]').tab('show');
  $('#festivalSelect').select2('val', festivalId, true);
};

var vennWidth, vennHeight;
var loadVennTab = function() {
  var o = {};
  o.festivals = festivalArray;
  o.id = 'vennSelect';
  var nav = Handlebars.compile($('#festMultiselect-template').html());
  $('#vennNav').html(nav(o));
  var width = $(window).width() - 10 - 10;
  $('#vennSelect').css('width','100%');
  $('#vennSelect').select2({
    placeholder: 'Select 2 or 3 festivals',
    maximumSelectionSize: 3
  }).on('change', function(e) {
    if (e.val.length === 2 || e.val.length === 3) {
      $('#venn_d').html('');
      makeVennDiagram(e.val);
    } else {
      $('#venn_d').html('');
    }
  });
  vennWidth = $(window).width() - 10 - 10;
  vennHeight = $(window).height() - 10 - 50 - 39 - 34 - 20 - 10;
};

var vennFestivals;
var makeVennDiagram = function(festivalIds) {
  vennFestivals = [];
  $.each(festivalIds, function(i,v) {
    vennFestivals.push({
      label: festivalJSON[v].festival,
      size: appearanceJSON.byFestival[v].length,
      festivalId: v
    });
  });
  var overlaps = getOverlaps(festivalIds)
    .sort(function(a,b){ return a.sets.length - b.sets.length; });
  var sets = venn.venn(vennFestivals, overlaps);
  var diagram = venn.drawD3Diagram(d3.select('#venn_d'), sets, vennWidth, vennHeight);
  wireupCircles(diagram, overlaps, sets);
};

var getOverlaps = function(festivalIds) {
  var data = [], overlaps = [];
  for (var i = 0; i < festivalIds.length; i++) {
    var fest = {
      festivals: [i],
      artists: appearanceJSON.byFestival[festivalIds[i]]
    };
    var d_length = data.length;
    for (var j = 0; j < d_length; j++) {
      data.push(mergeJoin(data[j], fest));
    }
    data.push(fest);
  }
  for (var k = 0; k < data.length; k++) {
    if (data[k].festivals.length > 1) {
      overlaps.push({
        sets: data[k].festivals,
        size: data[k].artists.length
      });
    }
  }
  return overlaps;
};

var mergeJoin = function(o1, o2) {
  var o = {
    festivals: o1.festivals.concat(o2.festivals),
    artists: []
  };
  var i = 0, j = 0;
  while( i < o1.artists.length && j < o2.artists.length ){
    if( o1.artists[i] < o2.artists[j] ) i++;
    else if( o1.artists[i] > o2.artists[j] ) j++;
    else { o.artists.push(o1.artists[i]); i++; j++; }
  }
  return o;
};

var wireupCircles = function(diagram, overlaps, sets) {
  var tooltip = d3.select('#tooltip');
  var tooltipContent = d3.select('#tooltipText');
  diagram.nodes
    .style('stroke-opacity', 0)
    .style('stroke', '#333')
    .style('stroke-width', '1')
    .on('mouseover', function(d, i) {
      var selection = d3.select(this).select('circle');
      selection.moveParentToFront()
        .transition()
        .style('fill-opacity', 0.5)
        .style('stroke-opacity', 1);

      tooltip.transition().style('display','inline');
      tooltipContent.text(d.size + " artists");
      var widthOffset = Math.floor($(tooltip.node()).width() / 2);
      tooltip.style("left", (d3.event.pageX - widthOffset) + "px")
        .style("top", (d3.event.pageY - 32) + "px");
    })
    .on('mouseout', function(d, i) {
      d3.select(this).select('circle').transition()
        .style('fill-opacity', 0.3)
        .style('stroke-opacity', 0);

      tooltip.transition().style('display','none');
    })
    .on("mousemove", function() {
      var widthOffset = Math.floor($(tooltip.node()).width() / 2);
      tooltip.style("left", (d3.event.pageX - widthOffset) + "px")
        .style("top", (d3.event.pageY - 32) + "px");
    })
    .on('click', function(d,i) {
      var festId = vennFestivals[i].festivalId;
      console.log(festId);
      createPopover([festId]);
    });

  diagram.svg.select('g').selectAll('path')
    .data(overlaps)
    .enter()
    .append('path')
    .attr('d', function(d) {
      return venn.intersectionAreaPath(d.sets.map(function(j) { return sets[j]; }));
    })
    .style('fill-opacity','0')
    .style('fill', 'black')
    .style('stroke-opacity', 0)
    .style('stroke', '#333')
    .style('stroke-width', '1')
    .on('mouseover', function(d, i) {
      d3.select(this).transition()
        .style('fill-opacity', 0.1)
        .style('stroke-opacity', 1);

      tooltip.transition().style('display','inline');
      tooltipContent.text(d.size + " artists");
      var widthOffset = Math.floor($(tooltip.node()).width() / 2);
      tooltip.style("left", (d3.event.pageX - widthOffset) + "px")
        .style("top", (d3.event.pageY - 32) + "px");
    })
    .on('mouseout', function(d, i) {
      d3.select(this).transition()
        .style('fill-opacity', 0)
        .style('stroke-opacity', 0);

      tooltip.transition().style('display', 'none');
    })
    .on("mousemove", function() {
      var widthOffset = Math.floor($(tooltip.node()).width() / 2);
      tooltip.style("left", (d3.event.pageX - widthOffset) + "px")
          .style("top", (d3.event.pageY - 32) + "px");
    })
    .on('click', function(d) {
      var festivalIds = [];
      d.sets.forEach(function(v,i) {
        festivalIds.push(vennFestivals[v].festivalId);
      });
      createPopover(festivalIds);
    });
};

var createPopover = function(festivalIds) {
  var modalTitle = '';
  festivalIds.forEach(function(v,i) {
    modalTitle += festivalJSON[v + ''].festival;
    if (i < festivalIds.length - 2) {
      modalTitle += ', ';
    }
    if (i === festivalIds.length - 2) {
      modalTitle += ' and ';
    }
  });
  var artists = getCommonArtists(festivalIds);
  $('#commonArtistModal .modalTitle').html(modalTitle + ' (' + artists.length + ' artists)');
  var modalBody = Handlebars.compile($('#artistList-template').html());
  $('#commonArtistModal .modal-body').html(modalBody({
    artists: artists
  }));
  $('#commonArtistModal').modal('show');
  $('.modalClose').click(function() {
    $('#commonArtistModal').modal('hide');
  });
};

var getCommonArtists = function(festivalIds) {
  var data = {
    festivals: [festivalIds[0]],
    artists: appearanceJSON.byFestival[festivalIds[0]]
  };
  for (var i = 1; i < festivalIds.length; i++) {
    data = mergeJoin(data, {
      festivals: [festivalIds[i]],
      artists: appearanceJSON.byFestival[festivalIds[i]]
    });
  }
  var artists = data.artists.map(function(v,i){
    return artistJSON[v];
  });
  return artists.sort(function(a,b){
    return a.artist.toUpperCase().localeCompare(
      b.artist.toUpperCase());
  });
};

var paletteMapping = [0,4,8,12,16,1,5,9,13,17,2,6,10,14,18,3,7,11,15,19];
var chordFill = function(i) {
  i = paletteMapping[i % palette.length];
  return palette[i]['500'];
};

var chordWidth, chordHeight, chordFestivalIds = [];
var loadChordTab = function() {
  var o = {};
  o.festivals = festivalArray;
  o.id = 'chordSelect';
  var nav = Handlebars.compile($('#festMultiselect-template').html());
  $('#chordNav').html(nav(o));
  $('#chordSelect').css('width','100%');
  $('#chordSelect').select2({
    placeholder: 'Select at least 3 festivals',
    maximumSelectionSize: 100
  }).on('change', function(e) {
    if (e.added)
      chordFestivalIds.push(e.added.id);
    else
      chordFestivalIds = chordFestivalIds.filter(function(ele) {
        return ele !== e.removed.id;
      });

    $('#chordNav .select2-search-choice').removeClass('chordChoice');
    if (e.val.length > 2) {
      $.each($('#chordNav .select2-search-choice'), function(i,v) {
        $(v).css('background-color', chordFill(i));
        var rgb = $(v).css('background-color');
        var rgba = (rgb.slice(0,rgb.length-1) + ',.5)').replace('rgb','rgba');
        $(v).css('background-color', rgba);
        $(v).addClass('chordChoice');
      });
      $('#chordBody').html('');
      makeChordDiagram(chordFestivalIds);
    } else {
      $('#chordBody').html('');
    }
  });
  chordWidth = $(window).width() - 10 - 10;
  chordHeight = $(window).height() - 10 - 50 - 39 - 34 - 30 - 10;
};

var getChordMatrix = function(festivalIds) {
  var matrix = festivalIds.map(function(v,i){
    return festivalIds.map(function(w,j){
      return chordJSON['f'+v]['f'+w];
    });
  });
  return matrix;
};

var makeChordDiagram = function(festivalIds) {
  var innerRadius = Math.min(chordWidth, chordHeight) * 0.41,
      outerRadius = innerRadius * 1.1;

  var matrix = getChordMatrix(festivalIds);
  var chord = d3.layout.chord()
    .padding(0.05)
    .sortSubgroups(d3.descending)
    .matrix(matrix);

  var svg = d3.select('#chordBody').append('svg')
    .attr('width', chordWidth)
    .attr('height', chordHeight)
    .append('g')
    .attr('id', 'circle')
    .attr('transform', 'translate(' + vennWidth / 2 + ',' + vennHeight / 2 + ')');

  svg.append("circle")
    .attr("r", outerRadius);

  svg.append('g').selectAll('path')
    .data(chord.groups)
    .enter().append('path')
    .style('fill', function(d) { return chordFill(d.index); })
    /*.style('stroke', 'grey')
    .style('stroke-width', '1')*/
    .attr('d', d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))
    .on('mouseover', function(d,i) {
      chordPaths.classed("fade", function(p) {
        return p.source.index != i && p.target.index != i;
      });
    });

  var tooltip = d3.select('#tooltip');
  var tooltipContent = d3.select('#tooltipText');
  var chordPaths = svg.append('g')
    .attr('class', 'chord')
    .selectAll('path')
    .data(chord.chords)
    .enter().append('path')
    .attr('d', d3.svg.chord().radius(innerRadius))
    .style('fill', function(d) { return chordFill(d.target.index); })
    .style('stroke', '#333')
    .style('stroke-width', '1')
    .style('opacity', 0.5)
    .style('stroke-opacity', 0)
    .on('mouseover', function(d,i) {
      d3.select(this).transition()
        .style('opacity', 0.8)
        .style('stroke-opacity', 1);

      var festId1 = festivalIds[d.source.index],
          festId2 = festivalIds[d.target.index],
          fest1 = festivalJSON[festId1+''],
          fest2 = festivalJSON[festId2+''],
          size = d.source.value;

      var content = fest1.festival + '<br>' + fest2.festival + '<br>' + size + ' artists';
      tooltip.transition().style('display', 'inline');
      tooltipContent.html(content);
      var widthOffset = Math.floor($(tooltip.node()).width() / 2);
      tooltip.style("left", (d3.event.pageX - widthOffset) + "px")
        .style("top", (d3.event.pageY - 72) + "px");
    })
    .on('mouseout', function(d,i) {
      d3.select(this).transition()
        .style('opacity', 0.5)
        .style('stroke-opacity', 0);

      tooltip.transition().style('display', 'none');
    })
    .on("mousemove", function() {
      var widthOffset = Math.floor($(tooltip.node()).width() / 2);
      tooltip.style("left", (d3.event.pageX - widthOffset) + "px")
        .style("top", (d3.event.pageY - 72) + "px");
    })
    .on('click', function(d,i) {
      var festId1 = festivalIds[d.source.index],
          festId2 = festivalIds[d.target.index];
      createPopover([festId1,festId2]);
    });
};

var loadSuggestTab = function() {
  var suggestAuto = artistAuto.map(function(v,i){
    return { id: v.artistId, text: v.artist };
  });
  $('#suggestInput').css('width','100%');
  $('#suggestInput').select2({
    data: suggestAuto,
    placeholder: 'Enter artists',
    multiple: true,
    query: function (q) {
      var pageSize = 20,
          results  = [];
      if (q.term && q.term !== '') {
        results = this.data.filter(function (v) {
          return (v.text.toLowerCase().indexOf(q.term.toLowerCase()) > -1);
        });
      } else if (q.term === '') {
        results = this.data;
      }
      q.callback({
        results: results.slice((q.page - 1) * pageSize, q.page * pageSize),
        more: results.length >= q.page * pageSize
      });
    }
  })
  .on('change', function(e) {
    var fests = getSuggestedFestivals(e.val);
    $('#suggestBody').html('');
    if (fests.length) {
      var template = Handlebars.compile($('#suggest-template').html());
      $('#suggestBody').html(template(fests));
    }
  });
};

var getSuggestedFestivals = function(artistIds) {
  var festivals = {}, maxArtist = 0;
  artistIds.forEach(function(v,i){
    var artist = artistJSON[v];
    var festIds = appearanceJSON.byArtist[v];
    festIds.forEach(function(w,j){
      if (typeof festivals[w] === 'undefined') {
        festivals[w] = {
          festival: festivalJSON[w],
          artists: [artist]
        };
      } else {
        festivals[w].artists.push(artist);
      }
      if (festivals[w].artists.length > maxArtist) {
        maxArtist = festivals[w].artists.length;
      }
    });
  });
  var tier1 = (maxArtist/3),
      tier2 = tier1 * 2;
  var festArray = [];
  for (var key in festivals) {
    var f = festivals[key];
    if (f.artists.length <= tier1)
      f.class = 'tier1';
    else if (f.artists.length <= tier2)
      f.class = 'tier2';
    else
      f.class = 'tier3';
    festArray.push(f);
  }
  festArray.sort(function(a,b) {
    return a.artists.length !== b.artists.length ?
      b.artists.length - a.artists.length :
      a.festival.festival.toUpperCase().localeCompare(b.festival.festival.toUpperCase());
  });
  return festArray;
};

var wcWidth, wcHeight;
var loadWCSuggestTab = function() {
  var suggestAuto = artistAuto.map(function(v,i){
    return { id: v.artistId, text: v.artist };
  });
  $('#wcsuggestInput').css('width','100%');
  $('#wcsuggestInput').select2({
    data: suggestAuto,
    placeholder: 'Enter artists',
    multiple: true,
    query: function (q) {
      var pageSize = 20,
          results  = [];
      if (q.term && q.term !== '') {
        results = this.data.filter(function (v) {
          return (v.text.toLowerCase().indexOf(q.term.toLowerCase()) > -1);
        });
      } else if (q.term === '') {
        results = this.data;
      }
      q.callback({
        results: results.slice((q.page - 1) * pageSize, q.page * pageSize),
        more: results.length >= q.page * pageSize
      });
    }
  })
  .on('change', function(e) {
    var fests = getSuggestedFestivals(e.val);
    $('#wcsuggestBody').html('');
    if (fests.length) {
      drawWC(fests);
    }
  });
  wcWidth = $(window).width() - 10 - 10;
  wcHeight = $(window).height() - 10 - 50 - 39 - 34 - 20 - 10;
};

var drawWC = function(festivals) {
  var fill = d3.scale.category20();
  var fontSize = d3.scale.log()
    .domain([
      d3.min(festivals, function(d) { return d.artists.length; }),
      d3.max(festivals, function(d) { return d.artists.length; })
    ])
    .range([Math.max(wcWidth/50,10), Math.min(wcWidth/14,80)]);

  var colorFill = d3.scale.quantize()
    .domain([
      d3.min(festivals, function(d) { return d.artists.length; }),
      d3.max(festivals, function(d) { return d.artists.length; })
    ])
    .range(['#9E9E9E','#757575','#757575','#424242','#212121']);

  var opacityScale = d3.scale.linear()
    .domain([
      d3.min(festivals, function(d) { return d.artists.length; }),
      d3.max(festivals, function(d) { return d.artists.length; })
    ])
    .range([0.4,0.8]);

  var draw = function (words) {
    var tooltip = d3.select('#tooltip');
    var tooltipContent = d3.select('#tooltipText');

    var tx = wcWidth/2,
        ty = wcHeight/2;
    d3.select('#wcsuggestBody').append('svg')
      .attr('width', wcWidth)
      .attr('height', wcHeight)
      .append('g')
      .attr('transform', 'translate(' + tx + ',' + ty + ')')
      .selectAll('g')
      .data(words)
      .enter()
      .append('g')
      .append('text')
      .style('font-size', function(d) { return d.size + 'px'; })
      .style('font-family', 'Impact')
      //.style('fill', function(d, i) { return fill(i); })
      //.style('fill', function(d, i) { return colorFill(d.artists.length); })
      .style('fill', '#212121')
      .style('fill-opacity', function(d, i) { return opacityScale(d.artists.length); })
      .attr('text-anchor', 'middle')
      .attr('transform', function(d) {
        return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')';
      })
      /*.attr('dx', function(d) { return d.x; })
      .attr('dy', function(d) { return d.y; })*/
      .text(function(d) { return d.festival.festival; })
      .on('mouseover', function(d,i) {
        var selection = d3.select(this.parentNode);
        var bbox = selection.node().getBBox();

        var dx = bbox.x + bbox.width/2,
            dy = bbox.y + bbox.height/2,
            cx = dx - 1.25*(dx),
            cy = dy - 1.25*(dy);
        selection.moveParentToFront().transition()
          .attr('transform', 'matrix(1.25, 0, 0, 1.25, ' + cx + ', ' + cy + ')');

        var location = locationJSON[d.festival.locationId].location,
            startDate = moment(d.festival.startDate).format('M/D'),
            endDate = moment(d.festival.endDate).format('M/D');
        
        var artists = d.artists.map(function(v,i){
          return v.artist;
        }).join(', ');

        var content = location + ' - ' + startDate + ' to ' + endDate + '<br>' + artists;
        tooltip.transition().style('display', 'inline');
        tooltipContent.html(content);
        var widthOffset = Math.floor($(tooltip.node()).width() / 2);
        tooltip.style("left", (d3.event.pageX - widthOffset) + "px")
          .style("top", (d3.event.pageY - 72) + "px");
      })
      .on('mouseout', function(d,i) {
        d3.select(this.parentNode).transition()
          .attr('transform', 'matrix(1, 0, 0, 1, 0, 0)');

        tooltip.transition().style('display', 'none');
      })
      .on("mousemove", function() {
        var widthOffset = Math.floor($(tooltip.node()).width() / 2);
        tooltip.style("left", (d3.event.pageX - widthOffset) + "px")
          .style("top", (d3.event.pageY - 72) + "px");
      })
      .on('click', function(d,i) {
        // take to festival list section?
      });
  };

  d3.layout.cloud().size([wcWidth-50, wcHeight-50])
    .words(festivals)
    .padding(5)
    .rotate(0)
    .overflow(true)
    .font('Impact')
    .fontSize(function(d) { return fontSize(d.artists.length); })
    .text(function(d) { return d.festival.festival; })
    .on('end', draw)
    .start();
};