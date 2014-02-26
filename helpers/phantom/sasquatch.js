var fs = require('fs');

var festivalName = 'Sasquatch';
var festivalUrls = [
    'http://www.sasquatchfestival.com/lineup/may',
    'http://www.sasquatchfestival.com/lineup/july'
];

var festivalArtists = [];

getFestivalArtists(festivalUrls.pop());

function getFestivalArtists(lineupUrl){

    if(festivalUrls.length === 0){

        // Write artists array to disk and exit
        fs.writeFileSync( festivalName.toLowerCase() + '.json', JSON.stringify(festivalArtists) );
        phantom.exit();
    }
  
    page = require('webpage').create();
    page.onError = function (msg, trace) {
        //console.log("PHANTOM ERROR: " + msg + " :: " + util.inspect(trace));
    });

    page.open(lineupUrl, function(status) {
        
        if(status !== "success"){

            // Error fetching page.  Crap.  Let's try the others
            getFestivalArtists( festivalUrls.pop() );
        }

        // Make sure jQuery is included for DOM retrieval
        page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function() {
            var lineupArtists = page.evaluate(function() {
                var artists = [];

                $('.image-group ul.images.sortable li.isotope-item').each(function(i, el) {
                    var artist = {};
                    artist.name = $(el).find('.image-caption').text().replace(/(['"])/g, '').toLowerCase();
                    
                    switch( $(el).data('day').toLowerCase() ){
                        case 'friday': artist.setTime = new Date("Jul 04 2014 20:00 GMT-0800 (PST)"); break;
                        case 'saturday': artist.setTime = new Date("Jul 05 2014 20:00 GMT-0800 (PST)"); break; 
                        case 'sunday': artist.setTime = new Date("Jul 06 2014 20:00 GMT-0800 (PST)"); break; 
                        default: artist.setTime = new Date("Jul 04 2014 20:00 GMT-0800 (PST)");
                    }

                    artist.stage = $(el).data('stage');
                    artist.link = $(el).find("a").attr('href');

                    artists.push(artist);
                });
                
                return artists;

            });

            page.release();

            console.log(lineupArtists);

            festivalArtists = festivalArtists.concat(lineupArtists);

            // Recurse
            getFestivalArtists( festivalUrls.pop() );
        });
    });
}
