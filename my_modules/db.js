var mysql = require('mysql'),
  logger = require('./logger.js');

var DB = function(config){

  var self = this;
  var connection;
  
  this.connect = function(caller, next) {
    handleDisconnect(caller,next);
  };

  var handleDisconnect = function(caller, next) {
    connection = mysql.createConnection(config.mysql);

    connection.connect(function(err) {
      if(err) {
        logger.log({
          caller: 'MYSQL',
          message: err
        });
        setTimeout(self.handleDisconnect(config,'self',next), 2000);
      } else {
        logger.log({
          caller: 'MYSQL',
          message: 'Connected',
          data: { caller: caller }
        });
        if (typeof next === 'function')
          next();
      }
    });
    connection.on('error', function(err) {
      logger.log({
        caller: 'MYSQL',
        message: err,
        data: { caller: caller }
      });
      if(err.code === 'PROTOCOL_CONNECTION_LOST') {
        handleDisconnect(caller);
      } else {
        throw err;
      }
    });
  };

  this.disconnect = function(next) {
    connection.end(function (err) {
      if (err) {
        logger.log({
          caller: 'MYSQL',
          message: 'Disconnect',
          data: err
        });
      } else {
        logger.log({
          caller: 'MYSQL',
          message: 'Disconnect'
        });
      }
      next();
    });
  };

  /**** FUNCTIONS ****/
  this.query = function(cmd, next, attempt) {
    if (typeof attempt === 'undefined') attempt = 1;
    var inserts = (typeof cmd.inserts !== 'undefined') ?
      cmd.inserts : [];
    var sql = connection.format(cmd.sql, inserts);
    connection.query(sql, function(err, res) {
      if (err) {
        logger.log({
          caller: 'MYSQL',
          message: err,
          data: sql
        });
        if (err.code === 'ER_LOCK_DEADLOCK') {
          console.log('Attempt ' + attempt);
          attempt++;
          self.query(cmd, next, attempt);
        }
      } else if (typeof next === 'function') {
        next(res);
      }
    });
  };

  this.queryHandleError = function(cmd, next) {
    var sql = connection.format(cmd.sql, cmd.inserts);
    connection.query(sql, next);
  };
  
};

/***** EXPORTS *****/
module.exports = DB;
