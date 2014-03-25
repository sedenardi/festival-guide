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
    loadFestivalTab();
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
      /*var feature = $(parent).attr('data-feature');
      var featureDiv = $('#' + feature);
      if (!$(featureDiv).html().length) {
        if (feature === 'festivals') {
        }
        var featureURL = './views/' + feature + '.handlebars';
        $.ajax({
          url: featureURL,
          cache: true,
          success: function(data) {
            var template = Handlebars.compile(data);
            $(featureDiv).html(template);
          }               
        });
      }*/
      window.location.hash = '#' + feature;
    } else {
      window.location.hash = '';
    }
  });
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