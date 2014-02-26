var db = require('../my_modules/db'),
    config = require('../config.json'),
    util = require('util'),
    path = require('path'),
    async = require('async'),
    fs = require('fs'),
    _und = require('underscore');

var festivalName = process.argv[2];
var cleanupAfterFetch = true;

/**
 * @desc: Run phantom.js thru a node child process, listening for errors on stderr
 * @param:  {function(error, festivalArtists)} cb
 */
var fetchFestivalArtists = exports.fetchFestivalArtists = function(cb){
    
    require('child_process').exec('phantomjs '+
        //path.resolve(__dirname, './phantom/', festivalName+'.js')+' --load-images=no ' +
        path.resolve(__dirname, './phantom/', festivalName+'.js')+
        (config.proxies && config.proxies.length > 0 ? '--proxy='+proxy.url+' --proxy-type='+proxy.type : ''), 
    function(err, stdout, stderr){

        if(err) return cb(err);
        console.log(stdout);

        if(!fs.existsSync('./phantom/'+festivalName+'.json')){
            var err = new Error("Could not locate fetch data");
            console.log( err );
            return cb(err);
        }

        var festivalArtists = require('./phantom/'+festivalName+'.json'); 

        // If specified, delete the fetched data on disk
        if(cleanupAfterFetch) fs.unlinkSync('./phantom/'+festivalName+'.json');

        console.log("Fetched festival artists: " + util.inspect(festivalArtists, false, 10));

        cb(null, festivalArtists);
    });
}

/**
 * @desc: Save our artist data to our db
 * @param: {function(error)} cb
 */
var saveFestivalArtistData = exports.saveFestivalArtistData = function(festivalArtists, cb){
    db.connection(config, 'artist-uploader', function(err){

        //TODO JS Array => SQL Query
        cb(null);

    });
}

async.waterfall([
    fetchFestivalArtists,
    saveFestivalArtistData
], function(err, res){
    if(err){
        console.log("ERROR fetching and saving artist data: " + util.inspect(err));
    }
    console.log("Successfully fetched and saved artist data. " + util.inspect(res || ''));
});
