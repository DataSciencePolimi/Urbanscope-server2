'use strict';
/* eslint-disable no-unused-expressions */


const START_DATE = '2015-01-01';

// API tests
describe( 'API', function() {
  let app;

  before( function initApp() {
    let api = require( '../api/' );
    app = api.listen();

    // app = 'http://localhost:1234';
  } );

  // Cache
  describe( 'cache', function() {
    it( 'Should have a cache MISS on the first try' );
    it( 'Should have a cache HIT on the second try' );
  } );

  describe( 'City', function() {

    it( 'should return 200 and JSON', function( done ) {
      request( app )
      .get( '/city/tweets/district' )
      .query( {
        startDate: START_DATE,
        lang: 'other',
      } )
      .expect( 'Content-Type', /json/ )
      .expect( 200 )
      .end( done );
    } );


    it( 'should return the passed parameters', function( done ) {
      request( app )
      .get( '/city/tweets/district' )
      .query( {
        startDate: START_DATE,
        lang: 'other',
      } )
      .expect( function( res ) {
        expect( res.body ).to.exist;

        let body = res.body;
        // Start date
        expect( body ).to.have.property( 'startDate', START_DATE );
        // language
        expect( body ).to.have.property( 'language', 'other' );
        // Selected nils (all)
        expect( body ).to.have.property( 'selectedNils' );
        expect( body.selectedNils ).to.not.be.empty;
        expect( body.selectedNils ).to.have.length( NUM_NILS );
      } )
      .end( done );
    } );

    it( 'should return the passed nils', function( done ) {
      request( app )
      .get( '/city/tweets/district' )
      .query( {
        startDate: START_DATE,
        lang: 'other',
        'nil_ID': '1,2,3,4,5,6',
      } )
      .expect( function( res ) {
        let body = res.body;
        // Selected nils (all)
        expect( body ).to.have.property( 'selectedNils' );
        expect( body.selectedNils ).to.not.be.empty;
        expect( body.selectedNils ).to.be.instanceof( Array );
        expect( body.selectedNils ).to.have.lengthOf( 6 );
        expect( body.selectedNils ).to.be.eql( [ 1, 2, 3, 4, 5, 6 ] );
      } )
      .end( done );
    } );

  } );

  describe.skip( 'Municipality', function() {

    it( 'should return 200 and JSON', function( done ) {
      request( app )
      .get( '/municipality/tweets/district' )
      .query( {
        startDate: START_DATE,
        lang: 'other',
      } )
      .expect( 'Content-Type', /json/ )
      .expect( 200 )
      .end( done );
    } );


    it( 'should return the passed parameters', function( done ) {
      request( app )
      .get( '/municipality/tweets/district' )
      .query( {
        startDate: START_DATE,
        lang: 'other',
      } )
      .expect( function( res ) {
        expect( res.body ).to.exist;

        let body = res.body;
        // Start date
        expect( body ).to.have.property( 'startDate', START_DATE );
        // language
        expect( body ).to.have.property( 'language', 'other' );
        // Selected nils (all)
        expect( body ).to.have.property( 'selectedMunicipalities' );
        expect( body.selectedMunicipalities ).to.not.be.empty;
        expect( body.selectedMunicipalities ).to.have.length( NUM_MUNICIPALITIES );
      } )
      .end( done );
    } );

    it( 'should return the passed nils', function( done ) {
      request( app )
      .get( '/municipality/tweets/district' )
      .query( {
        startDate: START_DATE,
        lang: 'other',
        'municipality_ID': '15146,15002,15005,15248,15246,15244',
      } )
      .expect( function( res ) {
        let body = res.body;
        // Selected nils (all)
        expect( body ).to.have.property( 'selectedMunicipalities' );
        expect( body.selectedMunicipalities ).to.not.be.empty;
        expect( body.selectedMunicipalities ).to.be.instanceof( Array );
        expect( body.selectedMunicipalities ).to.have.lengthOf( 6 );
        expect( body.selectedMunicipalities ).to.be.eql( [ 15146, 15002, 15005, 15248, 15246, 15244 ] );
      } )
      .end( done );
    } );


  } );







} );