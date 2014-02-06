var mysql = require('mysql');

var connection;

var handleDisconnect = function(config, caller, next) {
  connection = mysql.createConnection(config.mysql); // Recreate the connection, since
                                                  // the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('MYSQL-' + caller + ': error when connecting to db: ', err);
      setTimeout(handleDisconnect(config,'self',next), 2000); // We introduce a delay before attempting to reconnect,
    } else {                              // to avoid a hot loop, and to allow our node script to
      console.log('MYSQL-' + caller + ': connect success'); // process asynchronous requests in the meantime.
      next();
    }                                     // If you're also serving http, display a 503 error
  });
  connection.on('error', function(err) {
    console.log('MYSQL-' + caller + ': db error ', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect(config,'self',function(){});                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
};  

var disconnect = function() {
  connection.end(function (err) {
    if (err) {
      console.log('MYSQL: ', err);
    } else {
      console.log('MYSQL: disconnected');
      }
  });
};

/**** FUNCTIONS ****/
var query = function(cmd, next) {
  var sql = connection.format(cmd.sql, cmd.inserts);
  connection.query(sql, next);
};

var logError = function(error, next) {
  if (typeof error.source !== 'undefined' &&
    typeof error.message !== 'undefined' &&
    typeof error.stack !== 'undefined') {
    var cmd = {
      sql: 'Insert into Errors(Source,Message,Data) Select ?,?,?;',
      inserts: [error.source,error.message,error.stack]
    };
    queryWithError(cmd, function errorWriteDone(err, res) {
      if (err) {
        console.log('MYSQL: ' + err);
      } else {
        next(res);
      }
    });
  }
};

/***** EXPORTS *****/
module.exports.connect = handleDisconnect;
module.exports.disconnect = disconnect;
module.exports.query = query;
module.exports.logError = logError;