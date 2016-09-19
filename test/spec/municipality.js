'use strict';
/* eslint-disable no-unused-expressions */

const LANG_IT = 'it';
const LANG_OTHER = 'other';
const MUNICIPALITY_1 = 15146;
const MUNICIPALITY_2 = 15144;
const START_DATE = '2015-01-01';


let getApp = require( '../utils' ).getApp;

// Municipality tests
describe( 'Municipality', function() {
  let app;

  before( function initApp() {
    app = getApp();
  } );


  // Tweets
  describe( 'tweets', function() {



    // District
    describe.skip( 'district', function() {

      it( `should return 1 tweet for lang(${LANG_IT}) and municipality(${MUNICIPALITY_1})`, function( done ) {
        request( app )
        .get( '/municipality/tweets/district' )
        .query( {
          startDate: START_DATE,
          lang: LANG_IT,
          'municipality_ID': MUNICIPALITY_1,
        } )
        .expect( 'Content-Type', /json/ )
        .expect( 200 )
        .expect( function( res ) {
          expect( res.body ).to.exist;
          let body = res.body;

          // Municipalities
          expect( body ).to.have.property( 'municipalities' );
          let municipalities = body.municipalities;
          expect( municipalities ).to.have.length( 1 );

          // Municipality 1
          let municipality1 = municipalities[ 0 ];
          expect( municipality1 ).to.exist;
          expect( municipality1 ).to.have.property( 'value', 1 );
          expect( municipality1 ).to.have.property( 'municipality', MUNICIPALITY_1 );
          expect( municipality1.langs ).to.have.property( LANG_IT, 1 );
        } )
        .end( done );
      } );

      it( `should return 1 tweet for lang(${LANG_OTHER}) and municipality(${MUNICIPALITY_1})`, function( done ) {
        request( app )
        .get( '/municipality/tweets/district' )
        .query( {
          startDate: START_DATE,
          lang: LANG_OTHER,
          'municipality_ID': MUNICIPALITY_1,
        } )
        .expect( 'Content-Type', /json/ )
        .expect( 200 )
        .expect( function( res ) {
          expect( res.body ).to.exist;
          let body = res.body;

          // Municipalities
          expect( body ).to.have.property( 'municipalities' );
          let municipalities = body.municipalities;
          expect( municipalities ).to.have.length( 1 );

          // Municipality 1
          let municipality1 = municipalities[ 0 ];
          expect( municipality1 ).to.exist;
          expect( municipality1 ).to.have.property( 'value', 1 );
          expect( municipality1 ).to.have.property( 'municipality', MUNICIPALITY_1 );
          expect( municipality1.langs ).to.have.property( 'fr', 1 );
        } )
        .end( done );
      } );

      it( `should return 2 tweet for lang(${LANG_IT})`, function( done ) {
        request( app )
        .get( '/municipality/tweets/district' )
        .query( {
          startDate: START_DATE,
          lang: LANG_IT,
        } )
        .expect( 'Content-Type', /json/ )
        .expect( 200 )
        .expect( function( res ) {
          expect( res.body ).to.exist;
          let body = res.body;

          // Municipalities
          expect( body ).to.have.property( 'municipalities' );
          let municipalities = body.municipalities;
          expect( municipalities ).to.have.length( NUM_MUNICIPALITIES );

          let total = 0;
          // Municipality 1
          let municipality1 = municipalities.filter( d => d.municipality===MUNICIPALITY_1 )[ 0 ];
          expect( municipality1 ).to.exist;
          expect( municipality1 ).to.have.property( 'municipality', MUNICIPALITY_1 );
          expect( municipality1.langs ).to.have.property( LANG_IT, 1 );
          total += municipality1.value;
          // Municipality 2
          let municipality2 = municipalities.filter( d => d.municipality===MUNICIPALITY_2 )[ 0 ];
          expect( municipality2 ).to.exist;
          expect( municipality2 ).to.have.property( 'municipality', MUNICIPALITY_2 );
          expect( municipality2.langs ).to.have.property( LANG_IT, 1 );
          total += municipality2.value;

          expect( total ).to.be.eql( 2 );
        } )
        .end( done );
      } );

      it( `should return 2 tweet for lang(${LANG_OTHER})`, function( done ) {
        request( app )
        .get( '/municipality/tweets/district' )
        .query( {
          startDate: START_DATE,
          lang: LANG_OTHER,
        } )
        .expect( 'Content-Type', /json/ )
        .expect( 200 )
        .expect( function( res ) {
          expect( res.body ).to.exist;
          let body = res.body;

          // Municipalities
          expect( body ).to.have.property( 'municipalities' );
          let municipalities = body.municipalities;
          expect( municipalities ).to.have.length( NUM_MUNICIPALITIES );

          let total = 0;
          // Municipality 1
          let municipality1 = municipalities.filter( d => d.municipality===MUNICIPALITY_1 )[ 0 ];
          expect( municipality1 ).to.exist;
          expect( municipality1 ).to.have.property( 'municipality', MUNICIPALITY_1 );
          expect( municipality1.langs ).to.have.property( 'fr', 1 );
          total += municipality1.value;
          // Municipality 2
          let municipality2 = municipalities.filter( d => d.municipality===MUNICIPALITY_2 )[ 0 ];
          expect( municipality2 ).to.exist;
          expect( municipality2 ).to.have.property( 'municipality', MUNICIPALITY_2 );
          expect( municipality2.langs ).to.have.property( 'fr', 1 );
          total += municipality1.value;

          expect( total ).to.be.eql( 2 );
        } )
        .end( done );
      } );


    } );





    // Text
    describe( 'text', function() {

      it( `should return 1 tweet for lang(${LANG_IT}) and municipality(${MUNICIPALITY_1})`, function( done ) {
        request( app )
        .get( '/municipality/tweets/text' )
        .query( {
          startDate: START_DATE,
          lang: LANG_IT,
          limit: 2,
          'municipality_ID': MUNICIPALITY_1,
        } )
        .expect( 'Content-Type', /json/ )
        .expect( 200 )
        .expect( function( res ) {
          expect( res.body ).to.exist;
          let body = res.body;

          // Municipalities
          expect( body ).to.have.property( 'tweets' );
          let tweets = body.tweets;
          expect( tweets ).to.have.length( 1 );

          let tweet = tweets[ 0 ];
          expect( tweet ).to.exist;
          expect( tweet ).to.have.property( 'id' );
          expect( tweet ).to.have.property( 'lang', LANG_IT );
          expect( tweet ).to.have.property( 'date' );
          expect( tweet ).to.have.property( 'author' );
          expect( tweet ).to.have.property( 'authorId' );
          expect( tweet ).to.have.property( 'text' );
        } )
        .end( done );
      } );

      it( `should return 0 tweet for sensitive content lang(${LANG_IT}) and municipality(${MUNICIPALITY_2})`, function( done ) {
        request( app )
        .get( '/municipality/tweets/text' )
        .query( {
          startDate: START_DATE,
          lang: LANG_IT,
          limit: 2,
          'municipality_ID': MUNICIPALITY_2,
        } )
        .expect( 'Content-Type', /json/ )
        .expect( 200 )
        .expect( function( res ) {
          expect( res.body ).to.exist;
          let body = res.body;

          // Municipalities
          expect( body ).to.have.property( 'tweets' );
          let tweets = body.tweets;
          expect( tweets ).to.have.length( 0 );
        } )
        .end( done );
      } );

      it( `should return 0 tweet for sensitive content lang(${LANG_OTHER}) and municipality(${MUNICIPALITY_2})`, function( done ) {
        request( app )
        .get( '/municipality/tweets/text' )
        .query( {
          startDate: START_DATE,
          lang: LANG_OTHER,
          limit: 2,
          'municipality_ID': MUNICIPALITY_2,
        } )
        .expect( 'Content-Type', /json/ )
        .expect( 200 )
        .expect( function( res ) {
          expect( res.body ).to.exist;
          let body = res.body;

          // Municipalities
          expect( body ).to.have.property( 'tweets' );
          let tweets = body.tweets;
          expect( tweets ).to.have.length( 0 );
        } )
        .end( done );
      } );

    } );




    // Timeline
    describe.skip( 'timeline', function() {

      it( `should get correct montly counts for lang(${LANG_IT})`, function( done ) {
        request( app )
        .get( '/municipality/tweets/timeline' )
        .query( {
          startDate: '2014-01-01',
          endDate: '2015-12-31',
          lang: LANG_IT,
        } )
        .expect( 'Content-Type', /json/ )
        .expect( 200 )
        .expect( function( res ) {
          expect( res.body ).to.exist;
          let body = res.body;

          // Municipalities
          expect( body ).to.have.property( 'timeline' );
          let timeline = body.timeline;
          expect( timeline ).to.have.length( 24 );

          // 2014-02 => 0
          let date201402 = timeline.filter( d => d.date==='2014-02' )[ 0 ];
          expect( date201402 ).to.exist;
          expect( date201402 ).to.have.property( 'value', 0 );
          // 2014-05 => 1
          let date201405 = timeline.filter( d => d.date==='2014-05' )[ 0 ];
          expect( date201405 ).to.exist;
          expect( date201405 ).to.have.property( 'value', 1 );

          // 2015-05 => 0
          let date201505 = timeline.filter( d => d.date==='2015-05' )[ 0 ];
          expect( date201505 ).to.exist;
          expect( date201505 ).to.have.property( 'value', 0 );
          // 2015-06 => 2
          let date201506 = timeline.filter( d => d.date==='2015-06' )[ 0 ];
          expect( date201506 ).to.exist;
          expect( date201506 ).to.have.property( 'value', 2 );

        } )
        .end( done );
      } );

      it( `should get correct montly counts for lang(${LANG_OTHER})`, function( done ) {
        request( app )
        .get( '/municipality/tweets/timeline' )
        .query( {
          startDate: '2014-01-01',
          endDate: '2015-12-31',
          lang: LANG_OTHER,
        } )
        .expect( 'Content-Type', /json/ )
        .expect( 200 )
        .expect( function( res ) {
          expect( res.body ).to.exist;
          let body = res.body;

          // Municipalities
          expect( body ).to.have.property( 'timeline' );
          let timeline = body.timeline;
          expect( timeline ).to.have.length( 24 );

          // 2014-02 => 0
          let date201402 = timeline.filter( d => d.date==='2014-02' )[ 0 ];
          expect( date201402 ).to.exist;
          expect( date201402 ).to.have.property( 'value', 0 );
          // 2014-05 => 0
          let date201405 = timeline.filter( d => d.date==='2014-05' )[ 0 ];
          expect( date201405 ).to.exist;
          expect( date201405 ).to.have.property( 'value', 0 );

          // 2015-05 => 1
          let date201505 = timeline.filter( d => d.date==='2015-05' )[ 0 ];
          expect( date201505 ).to.exist;
          expect( date201505 ).to.have.property( 'value', 1 );
          // 2015-06 => 1
          let date201506 = timeline.filter( d => d.date==='2015-06' )[ 0 ];
          expect( date201506 ).to.exist;
          expect( date201506 ).to.have.property( 'value', 1 );

        } )
        .end( done );
      } );

    } );

  } );

} );