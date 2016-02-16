'use strict';
/* eslint-disable no-unused-expressions */

let request = require( 'supertest' );
let chai = require( 'chai' );
let expect = chai.expect;

let api = require( '../../../api/' );

// City tests
describe( 'City', function() {
  let app;

  before( function initApp() {
    app = api.listen();
  } );

  // Tweets
  describe( 'tweets', function() {

    // District
    describe( 'district', function() {

      it( 'should return 1 tweet', function( done ) {
        request( app )
        .get( '/city/tweets/district' )
        .query( {
          startDate: '2015-01-01',
          lang: 'other',
        } )
        .expect( 'Content-Type', /json/ )
        .expect( 200 )
        .expect( function( res ) {
          expect( res.body ).to.exist;

          let body = res.body;

          // Start date
          expect( body ).to.have.property( 'startDate', '2015-01-01' );

          // language
          expect( body ).to.have.property( 'language', 'other' );

          // Selected nils
          expect( body ).to.have.property( 'selectedNils' );
          expect( body.selectedNils ).to.not.be.empty;
          expect( body.selectedNils ).to.have.length( 88 );

          // Nils
          expect( body ).to.have.property( 'nils' );
          expect( body.nils ).to.have.length( 88 );
          expect( body.nils[ 0 ] ).to.have.all.keys( [
            'value',
            'langs',
            'nil',
          ] );

          // Nil 1
          let nil1 = body.nils.filter( d=> d.nil===1 )[ 0 ];
          expect( nil1 ).to.exist;
          expect( nil1 ).to.have.property( 'value', 1 );
          expect( nil1.langs ).to.have.property( 'fr', 1 );

        } )
        .end( done );
      } );

    } );

  } );

} );