var logger = require('./logger.js'),
  request = require('request'),
  util = require('util'),
  events = require('events');

var Downloader = function() {

  var self = this;  
  
  this.download = function(url, json, attempt) {
    if (typeof json === 'undefined') json = false;
    if (typeof attempt === 'undefined') attempt = 1;
    request({
      url: url,
      timeout: 30000,
      json: json
    }, function (error, response, body) {
      if (error || response.statusCode !== 200) {
        logger.log({
          caller: 'Downloader',
          message: 'error',
          params: {
            url: url,
            json: json,
            attempt: attempt
          },
          data: error
        });
        if (error.code === 'ETIMEDOUT' ||
          error.code === 'ESOCKETTIMEDOUT') {
          if (attempt < 10) {
            var timeout = attempt * 1000;
            setTimeout(function permitRetry(){
              self.download(url, json, attempt + 1);
            },timeout);
          } else {
            setTimeout(function waitLonger() {
              self.download(url, json);
            },60000);
          }
        }
        return;
      }
      self.emit('data',body);
    });
  };
  
};

util.inherits(Downloader, events.EventEmitter);

module.exports = Downloader;
