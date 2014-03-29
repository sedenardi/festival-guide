var festivalJSON, artistJSON, appearanceJSON;
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
  registerHelpers();

});

var finishLoading = function() {
  if (typeof artistJSON !== 'undefined' &&
    typeof festivalJSON !== 'undefined' &&
    typeof appearanceJSON !== 'undefined') {
    wireupTabs();
    loadArtistTab();
    loadFestivalTab();
    loadVennTab();
    var url = document.location.toString();
    if (url.match('#')) {
      $('.nav-tabs a[href=#'+url.split('#')[1]+']').click();
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

  Handlebars.registerPartial('appearance', $('#appearance-partial').html());
  Handlebars.registerPartial('artist', $('#artist-partial').html());
};

var wireupTabs  = function() {
  $('#homeTabs a').click(function (e) {
    e.preventDefault();
    $(this).tab('show');
    var parent = $(this).parent('li');
    if ($(parent).hasClass('featureTab')) {
      var feature = $(parent).attr('data-feature');
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
  currentArtist = 0;

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
            location: f.location,
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
  });

  var height = $(window).height() - 10 - 43 - 39 - 34 - 41 - 10;
  var width = $(window).width() - 10 - 10;
  $('#map-canvas').css('height',height);

  geocoder.geocode( { 'address': 'United States of America'}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      var myOptions = {
        zoom: 4,
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
      directionsDisplay = new google.maps.DirectionsRenderer();
      directionsDisplay.setOptions({
        draggable: false,
        suppressInfoWindows: false,
        suppressMarkers: true
      });
      directionsDisplay.setMap(map);
      directionsService = new google.maps.DirectionsService();

      
    } else {
      alert("Google Maps error: " + status);
    }
  });
};

var pinFestival = function(festival) {
  geocoder.geocode( { 'address': festival.location }, function(results, status) {
    if (status ==google.maps.GeocoderStatus.OK) {
      dropMarker(results[0].geometry.location, festival);
    } else {
      alert("Google Maps error: " + status);
    }
  })
};

var clearMarkers = function() {
  $.each(mapMarkers, function (i,v) {
    v.setMap(null);
  });
  mapMarkers.length = 0;
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
    festival.location + '<br>' + 
    dateString;
};

var plotFestivals = function(festivals) {
  var waypts = [];
  for (var i = 1; i < festivals.length - 1; i++) {
    waypts.push({
      location: festivals[i].location,
      stopover: true
    });
  }
  var request = {
    origin: festivals[0].location,
    destination: festivals[festivals.length - 1].location,
    waypoints: waypts,
    travelMode: google.maps.TravelMode.DRIVING
  };
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
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

var loadFestivalTab = function() {
  var o = {};
  o.festivals = [];
  for (var key in festivalJSON) {
    o.festivals.push(festivalJSON[key]);
  }
  var nav = Handlebars.compile($('#festivalNav-template').html());
  $('#festivalNav').html(nav(o));
  wireupFestivalTab();
};

var wireupFestivalTab = function() {
  $('.nav-festivals li a').click(function(e) {
    var parent = $(this).parent('li');
    if (!$(parent).hasClass('active')) {
      $('.nav-festivals li').removeClass('active');
      $(parent).addClass('active');
      fetchFestivalInfo($(this).attr('data-festival-id'));
    }
    e.preventDefault();
  });
};

var fetchFestivalInfo = function (festivalId) {
  var o = {};
  o.festival = festivalJSON[festivalId];
  o.artists = [];
  $.each(appearanceJSON.byFestival[festivalId], function(i ,v) {
    if (i%3 === 0) {
      var a = [artistJSON[v]];
      if (appearanceJSON.byFestival[festivalId].length > (i+1)) {
        a.push(artistJSON[appearanceJSON.byFestival[festivalId][i+1]]);
      }
      if (appearanceJSON.byFestival[festivalId].length > (i+2)) {
        a.push(artistJSON[appearanceJSON.byFestival[festivalId][i+2]]);
      }
      o.artists.push(a);
    }
  });
  console.log(o);
  var info = Handlebars.compile($('#festivalInfo-template').html());
  $('#festivalInfo').html(info(o));
  wireupArtistPopover();
};

var wireupArtistPopover = function() {
  $('.artistName').popover({
    placement: 'bottom',
    trigger: 'hover click',
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
};

var loadVennTab = function() {
  var o = {};
  o.festivals = [];
  for (var key in festivalJSON) {
    var exists = false;
    $.each(o.festivals, function(i,v) {
      exists = exists || festivalJSON[key].festival === v.festival;
    });
    if (!exists) {
      o.festivals.push(festivalJSON[key]);
    }
  }
  var nav = Handlebars.compile($('#festivalCheckboxes-template').html());
  $('#festivalCheckboxes').html(nav(o));
};