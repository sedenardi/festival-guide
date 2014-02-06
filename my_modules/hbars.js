var expressHandlebars  = require('express3-handlebars'),
  Handlebars = require('handlebars');

var exphbs = function(rootDir, config) {
  this.hbs = expressHandlebars.create({
    defaultLayout: 'main',
    handlebars: Handlebars,
    helpers: {
      json: function(obj) {
        return JSON.stringify(obj, null, 2);
      }
    },
    layoutsDir: rootDir + config.web.folders.layouts,
    partialsDir: rootDir + config.web.folders.partials
  });
};

module.exports = exphbs;