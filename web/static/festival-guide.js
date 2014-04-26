var festivalJSON, artistJSON, appearanceJSON, locationJSON;
$(document).ready(function() {
  $.ajax({
    url: './artists.json',
    cache: true,
    success: function(data) {
      artistJSON = data;
      finishLoading();
    }               
  });
  $.ajax({
    url: './festivals.json',
    cache: true,
    success: function(data) {
      festivalJSON = data;
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
  registerHelpers();
  $('.navbar-collapse ul li a').click(function(){
    $('.navbar-toggle:visible').click();
  });
});

var finishLoading = function() {
  if (typeof artistJSON !== 'undefined' &&
    typeof festivalJSON !== 'undefined' &&
    typeof appearanceJSON !== 'undefined' &&
    typeof locationJSON !== 'undefined') {
    wireupTabs();
    loadArtistTab();
    loadFestivalTab();
    loadVennTab();
    var url = document.location.toString();
    if (url.match('#')) {
      var feature = url.split('#')[1];
      $('.navbar-nav a[href=#' + feature + ']').tab('show');
      //$('.navbar-nav a[href=#' + feature + ']').click();
      /*$('.featureTab').removeClass('active');
      $('.featureTab[data-feature="' + feature + '"]').addClass('active');*/
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
  Handlebars.registerHelper('festivalWithWeek', function(obj) {
    return obj.festival + (obj.week !== null ? ' (Week ' + obj.week + ')' : '');
  });
  Handlebars.registerHelper('festivalWithDates', function(obj) {
    return obj.festival + ' ' + 
      moment(obj.startDate).format('M/D') + '-' + 
      moment(obj.endDate).format('M/D');
  });
  Handlebars.registerHelper('location', function(obj) {
    return obj.location.location;
  });

  Handlebars.registerPartial('appearance', $('#appearance-partial').html());
  Handlebars.registerPartial('artist', $('#artist-partial').html());
};

var wireupTabs  = function() {
  $('.navbar-nav a').click(function (e) {
    e.preventDefault();
    $(this).tab('show');
    var parent = $(this).parent('li');
    if ($(parent).hasClass('featureTab')) {
      var feature = $(parent).attr('data-feature');
      if (feature === 'artists') {
        setTimeout(function() {
          google.maps.event.trigger(map, "resize");
          map.setCenter(mapCenter);
        }, 200);
      }
      window.location.hash = '#' + feature;
    } else {
      window.location.hash = '';
    }
  });
};

var geocoder = new google.maps.Geocoder,
  infowindow = new google.maps.InfoWindow(),
  map,
  mapMarkers = [],
  directionsDisplay,
  directionsService,
  artistReq = null, 
  currentArtist = 0,
  mapCenter;

var loadArtistTab = function() {
  var artistAuto = [];
  for (var key in artistJSON) {
    artistAuto.push(artistJSON[key]);
  }
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
      $.each(appearanceJSON.byArtist[datum.artistId], function(i ,v) {
        var pushed = false;
        var f = festivalJSON[v];
        $.each(fests, function(j, w) {
          if (w.festival === f.festival) {
            w.startDates.push(f.startDate);
            w.endDates.push(f.endDate);
            pushed = true;
          }
        })
        if (!pushed) {
          fests.push({
            festivalId: f.festivalId,
            festival: f.festival,
            week: f.week,
            location: locationJSON[f.locationId],
            startDates: [f.startDate],
            endDates: [f.endDate]
          });
        }
      });
      clearMarkers();
      if (fests.length > 1 && fests.length <= 10) {
        plotFestivals(fests);
      } else {
        $.each(fests, function (i ,v) {
          pinFestival(v);
        });
      }
    }
    $('#artistInput').blur();
  });

  var height = $(window).height() - 10 - 43 - 39 - 34 - 41 - 10;
  var width = $(window).width() - 10 - 10;
  $('#map-canvas').css('height',height);
  $('#artistInput').css('width',width);
  var zoom = $(window).width() < 640 ? 3 : 4;

  geocoder.geocode( { 'address': 'United States of America'}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      mapCenter = results[0].geometry.location;
      var myOptions = {
        zoom: zoom,
        maxZoom: 10,
        minZoom: 3,
        center: results[0].geometry.location,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: false,
        scrollwheel: true,
        draggable: true,
        navigationControl: true,
        mapTypeControl: false,
        scaleControl: true,
        disableDoubleClickZoom: false
      };

      map = new google.maps.Map($("#map-canvas")[0], myOptions);
      //mapCenter = map.getCenter();
      directionsDisplay = new google.maps.DirectionsRenderer();
      directionsDisplay.setOptions({
        draggable: false,
        suppressInfoWindows: false,
        suppressMarkers: true
      });
      directionsService = new google.maps.DirectionsService();
    } else {
      alert("Google Maps error: " + status);
    }
  });
};

var pinFestival = function(festival) {
  dropMarker(festival.location, festival);
};

var clearMarkers = function() {
  $.each(mapMarkers, function (i,v) {
    v.setMap(null);
  });
  mapMarkers.length = 0;
  directionsDisplay.setMap(null);
};

var dropMarker = function(location, festival, marker) {
  var marker = new google.maps.Marker({
    position: location,
    map: map,
    icon: marker
  });
  google.maps.event.addListener(marker, 'click', (function(marker) {
    return function() {
      infowindow.setContent(infoWindowContent(festival));
      infowindow.open(map, marker);
    }
  })(marker));
  mapMarkers.push(marker);
};

var infoWindowContent = function(festival) {
  var dateString = '';

  $.each(festival.startDates, function(i, v) {
    dateString += moment(v).format('dddd, MMMM Do') + 
      ' to ' + moment(festival.endDates[i]).format('dddd, MMMM Do');
    if (i <= festival.startDates.length - 2) {
      dateString += '<br>';
    }
  });

  return festival.festival + '<br>' + 
    festival.location.location + '<br>' + 
    dateString;
};

var plotFestivals = function(festivals) {
  var waypts = [];
  for (var i = 1; i < festivals.length - 1; i++) {
    waypts.push({
      location: festivals[i].location.location,
      stopover: true
    });
  }
  var request = {
    origin: festivals[0].location.location,
    destination: festivals[festivals.length - 1].location.location,
    waypoints: waypts,
    travelMode: google.maps.TravelMode.DRIVING
  };
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
      directionsDisplay.setMap(map);
      dropDirectionMarkers(response.routes[0].legs, festivals);
    } else {
      alert("Google Maps error: " + status);
    }
  })
};

var dropDirectionMarkers = function(route, festivals) {
  for (var i = 0; i < route.length; i++) {
    var markerImg = './static/images/marker' + (i + 1) + '.png';
    dropMarker(route[i].start_location, festivals[i], markerImg);
  }
  var markerImg = './static/images/marker' + (route.length + 1) + '.png';
  dropMarker(route[route.length - 1].end_location, festivals[route.length], markerImg);
};

var currentFestival;
var loadFestivalTab = function() {
  var o = {};
  o.festivals = [];
  for (var key in festivalJSON) {
    o.festivals.push(festivalJSON[key]);
  }
  o.festivals.sort(function(a,b){
    return moment(a.startDate).valueOf() - moment(b.startDate).valueOf();
  });
  var nav = Handlebars.compile($('#festivalNav-template').html());
  $('#festivalNav').html(nav(o));
  var width = $(window).width() - 10 - 10;
  $('#festivalSelect').css('width',width);
  $('#festivalSelect').select2({
    placeholder: 'Select a festival'
  }).on("select2-selecting", function(e) { 
    if (e.val !== currentFestival) {
      currentFestival = e.val;
      fetchFestivalInfo(currentFestival);
    }
  });
};

var fetchFestivalInfo = function (festivalId) {
  var o = {};
  o.festival = festivalJSON[festivalId];
  o.festival.location = locationJSON[o.festival.locationId];
  o.artists = [];
  var sortedArtistIds = getSortedArtists(festivalId);
  $.each(sortedArtistIds, function(i ,v) {
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
  $('#festivalInfo').html(info(o));
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
  var isTouchDevice = ("ontouchstart" in window) || window.DocumentTouch && document instanceof DocumentTouch;
  $('.artistName').popover({
    placement: 'bottom',
    trigger: isTouchDevice ? "click" : "hover",
    title: 'Artist Info',
    html: true,
    content: function() {
      var artistId = $(this).attr('data-artist-id');
      var o = {};
      o.info = [];
      $.each(appearanceJSON.byArtist[artistId], function(i,v) {
        o.info.push(festivalJSON[v]);
      });
      var pop = Handlebars.compile($('#artistPopover-template').html());
      return pop(o);
    }
  });
  /*if (isTouchDevice) {
    $('.artistName').click(function () {
      $('.artistName').not(this).popover('hide');
    });
  }*/
};

var vennWidth, vennHeight;
var loadVennTab = function() {
  var o = {};
  o.festivals = [];
  for (var key in festivalJSON) {
    o.festivals.push(festivalJSON[key]);
  }
  o.festivals.sort(function(a,b){
    return a.festival.toUpperCase().localeCompare(
      b.festival.toUpperCase());
  });
  var nav = Handlebars.compile($('#vennFestivals-template').html());
  $('#vennNav').html(nav(o));  
  var width = $(window).width() - 10 - 10;
  $('#vennSelect').css('width',width);
  $('#vennSelect').select2({
    placeholder: 'Select 2 or 3 festivals',
    maximumSelectionSize: 3
  }).on("change", function(e) {
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
  var overlaps = getOverlaps(festivalIds);
  var data = venn.venn(vennFestivals, overlaps);
  venn.drawD3Diagram(d3.select('#venn_d'), data, vennWidth, vennHeight, null, null);
  wireupCircles();
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
  for (var i = 0; i < data.length; i++) {
    if (data[i].festivals.length > 1) {
      overlaps.push({
        sets: data[i].festivals,
        size: data[i].artists.length
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
}

var wireupCircles = function() {
  $('circle').unbind('click');
  $('circle').click(function (e) {
    var x = e.offsetX || e.layerX, 
      y = e.offsetY || e.layerY;
    var set = [];
    $.each($('circle'), function(i, v) {
      if (pointInCircle(x, y, v)) {
        set.push($(v).attr('index'));
      }
    });
    if (set.length > 1) {
      createPopover(x, y, set);
    }
  });
};

var pointInCircle = function(x,y,circle) {
  var dx = Math.abs(x - $(circle).attr('cx')),
    dy = Math.abs(y - $(circle).attr('cy')),
    r = $(circle).attr('r');
  if (dx + dy <= r)
    return true;
  else if (dx > r || dy > r)
    return false;
  else
    return (dx*dx + dy*dy <= r*r);
};

var createPopover = function(x, y, set) {
  var modalTitle = '',
    festivalIds = [];
  $.each(set, function(i, v) {
    modalTitle += vennFestivals[v].label;
    festivalIds.push(vennFestivals[v].festivalId);
    if (i < set.length - 2) {
      modalTitle += ', ';
    } 
    if (i === set.length - 2) {
      modalTitle += ' and ';
    }
  });
  var artists = getCommonArtists(festivalIds);
  $('#vennModal .modalTitle').html(modalTitle + ' (' + artists.length + ' artists)');
  var modalBody = Handlebars.compile($('#artistList-template').html());
  $('#vennModal .modal-body').html(modalBody({
    artists: artists
  }));
  $('#vennModal').modal('show');
  $('.modalClose').click(function() {
    $('#vennModal').modal('hide');
  });
};

var getCommonArtists = function(festivalIds) {
  var artists = [];
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
  for (var i = 0; i < data.artists.length; i++) {
    artists.push(artistJSON[data.artists[i]]);
  }
  return artists;
};