'use strict';
let api = require( '../api/' );

module.exports.getApp = function() {

  let app = api.listen();
  // app = 'http://localhost:1234';

  return app;
}