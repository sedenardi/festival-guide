var festivalJSON, artistJSON, appearanceJSON;
$(document).ready(function() {
  var url = document.location.toString();
  if (url.match('#')) {
    $('.nav-tabs a[href=#'+url.split('#')[1]+']').click();
  }
  $.ajax({
    url: './artists.json',
    cache: true,
    success: function(data) {
      artistJSON = data;
    }               
  });
  $.ajax({
    url: './festivals.json',
    cache: true,
    success: function(data) {
      festivalJSON = data;
    }               
  });
  $.ajax({
    url: './appearances.json',
    cache: true,
    success: function(data) {
      appearanceJSON = data;
    }               
  });
  wireupTabs();
});

var wireupTabs  = function() {
  $('#homeTabs a').click(function (e) {
    e.preventDefault();
    $(this).tab('show');
    var parent = $(this).parent('li');
    if ($(parent).hasClass('featureTab')) {
      var feature = $(parent).attr('data-feature');
      var featureDiv = $('#' + feature);
      if (feature === 'festivals') {
        var o = {};
        o.festivals = [];
        for (var key in festivalJSON) {
          o.festivals.push(festivalJSON[key]);
        }
        console.log(o);
        $.ajax({
          url: './views/festivals.handlebars',
          cache: true,
          success: function(data) {
            var template = Handlebars.compile(data);
            $(featureDiv).html(template(o));
          }               
        });
      }
      /*if (!$(featureDiv).html().length) {
        
      }*/
      window.location.hash = '#' + feature;
    } else {
      window.location.hash = '';
    }
  });
};