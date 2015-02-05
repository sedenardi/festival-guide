d3.selection.prototype.moveParentToFront = function() {
  return this.each(function(){
    this.parentNode.parentNode.appendChild(this.parentNode);
  });
};

var locationHash = {}, locationArray = [], worldCenter;
var inflateLocations = function(data) {
  data.locations.forEach(function(v,i){
    var location = {
      locationId: v[0],
      city: v[1],
      state: v[2],
      country: v[3],
      lat: v[4],
      lng: v[5],
      festivals: []
    };

    var locArray = [];
    if (location.city.length) locArray.push(location.city);
    if (location.state.length) locArray.push(location.state);
    location.shortLocation = locArray.join(', ');
    if (location.country.length) locArray.push(location.country);
    location.location = locArray.join(', ');

    locationArray.push(location);
    locationHash[location.locationId] = location;
  });

  worldCenter = new google.maps.LatLngBounds();
  locationArray.forEach(function(v,i){
    var latlng = new google.maps.LatLng(v.lat, v.lng);
    worldCenter.extend(latlng);
  });
};

var festivalDateHash = { byFestivalDate: {}, byFestival: {} };
var inflateFestivalDates = function(data) {
  data.festivalDates.forEach(function(v,i){
    var festivalDate = {
      festivalDateId: v[0],
      festivalId: v[1],
      week: v[2],
      startDate: v[3],
      endDate: v[4]
    };
    festivalDateHash.byFestivalDate[festivalDate.festivalDateId] = festivalDate;

    if (typeof festivalDateHash.byFestival[festivalDate.festivalId] === 'undefined') {
      festivalDateHash.byFestival[festivalDate.festivalId] = [festivalDate];
    } else {
      festivalDateHash.byFestival[festivalDate.festivalId].push(festivalDate);
    }
  });
};

var festivalHash = {}, festivalArray = [];
var inflateFestivals = function(data) {
  data.festivals.forEach(function(v,i){
    var festival = {
      festivalId: v[0],
      festival: v[1],
      locationId: v[2],
      website: v[3],
    };
    festival.dates = festivalDateHash.byFestival[festival.festivalId];
    festival.getDates = function() {
      return this.dates.map(function(v,i){
        return moment(v.startDate).format('M/D') + '-' +
          moment(v.endDate).format('M/D');
      }).join(', ');
    };

    festivalHash[festival.festivalId] = festival;
    festivalArray.push(festival);
    locationHash[festival.locationId].festivals.push(festival);
  });

  festivalArray.forEach(function(v,i){
    v.location = locationHash[v.locationId];
  });
  festivalArray.sort(function(a,b){
    return a.festival.toUpperCase().localeCompare(
      b.festival.toUpperCase());
  });
};

var artistHash = {}, artistAuto = [];
var inflateArtists = function(data) {
  data.artists.forEach(function(v,i){
    var artist = {
      artistId: v[0],
      artist: v[1]
    };
    artistHash[artist.artistId] = artist;
    artistAuto.push(artist);
  });
  artistAuto.sort(function(a,b) {
    return a.artist.toUpperCase().localeCompare(b.artist.toUpperCase());
  });
};

var appearanceHash = {
  byArtist: {},
  getFestivalArray: function(artistId) {
    var a = [];
    for (var key in this.byArtist[artistId])
      a.push(key);
    return a;
  },
  byFestival: {},
  getArtistArray: function(festivalId) {
    var a = [];
    for (var key in this.byFestival[festivalId])
      a.push(key);
    return a;
  },
  getSortedArtistIntArray: function(festivalId) {
    return this.getArtistArray(festivalId)
      .map(function(v,i){ return parseInt(v,10); })
      .sort(function(a,b){ return a - b; });
  }
};
var inflateAppearances = function(data) {
  data.appearances.forEach(function(v,i){
    var festivalDateId = v[0],
        artistId = v[1],
        festivalId = festivalDateHash.byFestivalDate[v[0]].festivalId;

    if (typeof appearanceHash.byArtist[artistId] === 'undefined') {
      appearanceHash.byArtist[artistId] = {};
      appearanceHash.byArtist[artistId][festivalId] = [festivalDateId];
    } else if (typeof appearanceHash.byArtist[artistId][festivalId] === 'undefined') {
      appearanceHash.byArtist[artistId][festivalId] = [festivalDateId];
    } else {
      appearanceHash.byArtist[artistId][festivalId].push(festivalDateId);
    }

    if (typeof appearanceHash.byFestival[festivalId] === 'undefined') {
      appearanceHash.byFestival[festivalId] = {};
      appearanceHash.byFestival[festivalId][artistId] = [festivalDateId];
    } else if (typeof appearanceHash.byFestival[festivalId][artistId] === 'undefined') {
      appearanceHash.byFestival[festivalId][artistId] = [festivalDateId];
    } else {
      appearanceHash.byFestival[festivalId][artistId].push(festivalDateId);
    }
  });
};

var chordHash = {};
var inflateChord = function(data) {
  data.chordData.forEach(function(v,i){
    var id1 = v[0],
        id2 = v[1],
        count = v[2];

    if (typeof chordHash[id1] === 'undefined')
      chordHash[id1] = {};
    chordHash[id1][id2] = count;

    if (id1 !== id2) {
      if (typeof chordHash[id2] === 'undefined')
        chordHash[id2] = {};
      chordHash[id2][id1] = count;
    }
  });
};

var doStats = function() {
  var statFest = festivalArray.length;
  var statArtist = artistAuto.length;

  var statCity = 0;
  var countryHash = {};
  for (var key in locationHash) {
    statCity++;
    var country = locationHash[key].country;
    if (typeof countryHash[country] === 'undefined')
      countryHash[country] = country;
  }
  var statCountry = 0;
  for (var c in countryHash)
    statCountry++;

  $('#statFest').text(statFest);
  $('#statArtist').text(statArtist);
  $('#statCity').text(statCity);
  $('#statCountry').text(statCountry);
};

$(document).ready(function() {
  $.ajax({
    url: './allInfo.json',
    cache: true,
    success: function(data) {
      inflateLocations(data);
      inflateFestivalDates(data);
      inflateFestivals(data);
      inflateArtists(data);
      inflateAppearances(data);
      inflateChord(data);
      doStats();
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
  loadFestivalMapTab();
  loadArtistTab();
  loadFestivalListTab();
  loadChordTab();
  loadWCSuggestTab();
  var url = document.location.toString();
  if (url.match('#')) {
    var feature = url.split('#')[1];
    $('.navbar-nav a[href=#' + feature + ']').tab('show');
  }
};

var registerHelpers = function() {
  Handlebars.registerHelper('json', function(obj) {
    return JSON.stringify(obj, null, 2);
  });
  Handlebars.registerHelper('prettyDateRange', function(obj) {
    return obj.dates.map(function(v,i){
      return moment(v.startDate).format('dddd, MMMM Do') +
        ' to ' + moment(v.endDate).format('dddd, MMMM Do');
    }).join(', ');
  });
  Handlebars.registerHelper('simpleDateRange', function(obj) {
    return obj.getDates();
  });
  Handlebars.registerHelper('festivalWithLocationAndDates', function(obj) {
    return obj.festival + ' - ' + obj.location.shortLocation + ' - ' +
      obj.getDates();
  });
  Handlebars.registerHelper('location', function(obj) {
    return locationHash[obj.locationId].location;
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
      artistMap.fitBounds(artistBounds);
    }, 300);
  } else if (feature === 'festival-map') {
    setTimeout(function() {
      google.maps.event.trigger(festivalMap, 'resize');
      festivalMap.setCenter(worldCenter);
    }, 300);
  }
};

var infowindow = new google.maps.InfoWindow(),
  artistMap,
  mapMarkers = [],
  directionsDisplay,
  directionsService,
  artistReq = null,
  currentArtist = 0,
  artistBounds;

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
      var fests = appearanceHash.getFestivalArray(datum.artistId).map(function(v,i) {
        var f = festivalHash[v];
        f.festivalDates = appearanceHash.byArtist[datum.artistId][v].map(function(w,j){
          return festivalDateHash.byFestivalDate[w];
        });
        f.location = locationHash[f.locationId];
        return f;
      });
      fests.sort(function(a,b){
        return a.festivalDates[0].startDate - b.festivalDates[0].startDate;
      });
      var startCountry = fests[0].location.country,
          singleCountry = true;
      fests.forEach(function(v,i){
        singleCountry = singleCountry && v.location.country === startCountry;
      });
      clearMarkers();
      if (fests.length > 1 && fests.length <= 10 && singleCountry) {
        plotFestivals(fests);
      } else {
        fests.forEach(function(v,i) {
          dropMarker(artistMap, v.location, v);
        });
        artistBounds = new google.maps.LatLngBounds();
        fests.forEach(function(v,i){
          var latlng = new google.maps.LatLng(v.location.lat, v.location.lng);
          artistBounds.extend(latlng);
        });
        artistMap.fitBounds(artistBounds);
      }
    }
    $('#artistInput').blur();
  });

  var height = $(window).height() - 10 - 43 - 39 - 34 - 32 - 10;
  var width = $(window).width() - 10 - 10;
  $('#artist-map-canvas').css('height',height);
  $('#artistInput').css('width',width);

  var myOptions = getMapOptions();
  artistMap = new google.maps.Map($('#artist-map-canvas')[0], myOptions);
  artistBounds = worldCenter;
  artistMap.fitBounds(artistBounds);

  directionsDisplay = new google.maps.DirectionsRenderer();
  directionsDisplay.setOptions({
    draggable: false,
    suppressInfoWindows: false,
    suppressMarkers: true
  });
  directionsService = new google.maps.DirectionsService();
};

var getMapOptions = function(center) {
  return {
    maxZoom: 10,
    minZoom: 3,
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
  return festival.festival + '<br>' +
    festival.location.location + '<br>' +
    festival.getDates();
};

var plotFestivals = function(festivals) {
  var waypts = festivals.map(function(v,i){
    return { location: v.location.location, stopover: true };
  });

  var request = {
    origin: festivals[0].location.location,
    destination: festivals[festivals.length - 1].location.location,
    waypoints: waypts.slice(1,waypts.length-1),
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

var currentFestival;
var loadFestivalListTab = function() {
  var o = {};
  o.festivals = festivalArray.slice(0);
  o.festivals.sort(function(a,b){
    return a.dates[0].startDate - b.dates[0].startDate;
  });
  o.id = 'festivalSelect';
  var nav = Handlebars.compile($('#festMultiselect-template').html());
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
  o.festival = festivalHash[festivalId];
  o.artists = [];
  var sortedArtistIds = appearanceHash.getArtistArray(festivalId).sort(function(a,b){
    return artistHash[a].artist.toUpperCase().localeCompare(
      artistHash[b].artist.toUpperCase());
  });
  sortedArtistIds.forEach(function(v,i) {
    if (i%3 === 0) {
      var a = [artistHash[v]];
      if (sortedArtistIds.length > (i+1)) {
        a.push(artistHash[sortedArtistIds[i+1]]);
      } else {
        a.push('');
      }
      if (sortedArtistIds.length > (i+2)) {
        a.push(artistHash[sortedArtistIds[i+2]]);
      } else {
        a.push('');
      }
      o.artists.push(a);
    }
  });
  var info = Handlebars.compile($('#festivalInfo-template').html());
  $('#festivalListInfo').html(info(o));
  wireupArtistPopover();
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
      o.info = appearanceHash.getFestivalArray(artistId).map(function(v,i) {
        var f = festivalHash[v];
        f.location = locationHash[f.locationId];
        return f;
      });
      var pop = Handlebars.compile($('#artistPopover-template').html());
      return pop(o);
    }
  });
};

var festivalMap;
var loadFestivalMapTab = function() {
  var height = $(window).height() - 50 - 53 - 10;
  $('#festival-map-canvas').css('height',height);
  var myOptions = getMapOptions();
  festivalMap = new google.maps.Map($('#festival-map-canvas')[0], myOptions);
  festivalMap.fitBounds(worldCenter);
  plotAllFestivals();
};

var plotAllFestivals = function() {
  for (var loc in locationHash) {
    dropLocationMarker(festivalMap, locationHash[loc]);
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
      v.getDates() + '</span></li>';
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

var createPopover = function(festivalIds) {
  var modalTitle = '';
  festivalIds.forEach(function(v,i) {
    modalTitle += festivalHash[v].festival;
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
  $('#commonArtistModal .modal-body').html(modalBody({ artists: artists }));
  $('#commonArtistModal').modal('show');
  $('.modalClose').click(function() {
    $('#commonArtistModal').modal('hide');
  });
};

var getCommonArtists = function(festivalIds) {
  var data = {
    festivals: [festivalIds[0]],
    artists: appearanceHash.getSortedArtistIntArray(festivalIds[0])
  };
  for (var i = 1; i < festivalIds.length; i++) {
    data = mergeJoin(data, {
      festivals: [festivalIds[i]],
      artists: appearanceHash.getSortedArtistIntArray(festivalIds[i])
    });
  }
  var artists = data.artists.map(function(v,i){
    return artistHash[v];
  });
  return artists.sort(function(a,b){
    return a.artist.toUpperCase().localeCompare(
      b.artist.toUpperCase());
  });
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

var paletteMapping = [0,4,8,12,16,1,5,9,13,17,2,6,10,14,18,3,7,11,15,19];
var chordFill = function(i) {
  i = paletteMapping[i % palette.length];
  return palette[i]['500'];
};

var chordWidth, chordHeight, chordFestivalIds = [];
var loadChordTab = function() {
  var o = {};
  o.festivals = festivalArray.slice(0);
  o.id = 'chordSelect';
  o.multiple = 'multiple';
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
      return chordHash[v][w];
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
    .attr('transform', 'translate(' + chordWidth / 2 + ',' + chordHeight / 2 + ')');

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
      $('#chordSelect').blur();
      d3.select(this).transition()
        .style('opacity', 0.8)
        .style('stroke-opacity', 1);

      var festId1 = festivalIds[d.source.index],
          festId2 = festivalIds[d.target.index],
          fest1 = festivalHash[festId1],
          fest2 = festivalHash[festId2],
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

var getSuggestedFestivals = function(artistIds) {
  var festivals = {}, maxArtist = 0;
  artistIds.forEach(function(v,i){
    var artist = artistHash[v];
    var festIds = appearanceHash.getFestivalArray(v);
    festIds.forEach(function(w,j){
      if (typeof festivals[w] === 'undefined') {
        festivals[w] = {
          festival: festivalHash[w],
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
  wcHeight = $(window).height() - 10 - 50 - 39 - 34 - 20 - 10 - 30;
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
      .style('font-family', '\'Open Sans\', sans-serif')
      .style('font-weight', 'bold')
      .style('letter-spacing', '-1px')
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
        $('#wcsuggestInput').blur();
        var selection = d3.select(this.parentNode);
        var bbox = selection.node().getBBox();

        var dx = bbox.x + bbox.width/2,
            dy = bbox.y + bbox.height/2,
            cx = dx - 1.25*(dx),
            cy = dy - 1.25*(dy);
        selection.moveParentToFront().transition()
          .attr('transform', 'matrix(1.25, 0, 0, 1.25, ' + cx + ', ' + cy + ')');
        
        var artists = d.artists.map(function(v,i){
          return v.artist;
        }).join(', ');

        var content = locationHash[d.festival.locationId].shortLocation + ' - ' +
          d.festival.getDates() + '<br>' + artists;

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
    .font('\'Open Sans\', sans-serif')
    .fontSize(function(d) { return fontSize(d.artists.length); })
    .text(function(d) { return d.festival.festival; })
    .on('end', draw)
    .start();
};