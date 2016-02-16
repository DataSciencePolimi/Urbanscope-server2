'use strict';
/* eslint-disable no-unused-expressions */

let api = require( '../api/' );

// API tests
describe( 'API', function() {
  let app;

  before( function initApp() {
    app = api.listen();
  } );

  // Cahce
  describe( 'cache', function() {
    it( 'Should have a cache MISS on the first try' );
    it( 'Should have a cache HIT on the second try' );
  } );

} );