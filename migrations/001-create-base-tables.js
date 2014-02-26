var db = require('../my_modules/db'),
    async = require('async'),
    fs = require('fs'),
    path = require('path'),
    config = require('../config.json'),
    util = require('util');

exports.up = function(cb){
    var createStmnts = ['artists.sql', 'festivals.sql', 'appearances.sql'];

    function executeSqlCreate(sqlFile, cb){
        fs.readFile( path.resolve(__dirname, '../db_models/', sqlFile ), { encoding: 'utf8' }, function(err, sqlString){
            if(err) return cb(err);
            db.query(sqlString, cb);
        });
    }

    db.connect(config, 'migration', function(err){ 
        if(err) return cb(err);
        async.eachSeries(createStmnts, executeSqlCreate, function(err, res){
            if(err) return cb(err);
            cb(null);
        });
    });
};

exports.down = function(cb){
    db.connect(config, 'migration', function(err){
        if(err) return cb(err);
        db.query('DROP TABLE appearances; DROP TABLE festivals; DROP TABLE artists;', cb);
    });
};
