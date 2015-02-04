var expressHandlebars  = require('express-handlebars'),
  Handlebars = require('handlebars'),
  moment = require('moment');

var exphbs = function(rootDir, config) {
  this.hbs = expressHandlebars.create({
    defaultLayout: 'main',
    handlebars: Handlebars,
    helpers: {
      json: function(obj) {
        return JSON.stringify(obj, null, 2);
      },
      prettyDateRange: function(obj) {
        return moment(obj.startDate).format('dddd, MMMM Do') +
          ' to ' + moment(obj.endDate).format('dddd, MMMM Do');
      }
    },
    layoutsDir: rootDir + config.web.folders.layouts,
    partialsDir: rootDir + config.web.folders.partials
  });
};

module.exports = exphbs;
