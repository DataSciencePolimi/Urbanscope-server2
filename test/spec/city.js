'use strict';
/* eslint-disable no-unused-expressions */

const LANG_IT = 'it';
const LANG_OTHER = 'other';
const NIL_1 = 1;
const NIL_2 = 2;
const START_DATE = '2015-01-01';


let getApp = require( '../utils' ).getApp;

// City tests
describe( 'City', function() {
  let app;

  before( function initApp() {
    app = getApp();
  } );


  // Tweets
  describe( 'tweets', function() {



    // District
    describe( 'district', function() {

      it( `should return 1 tweet for lang(${LANG_IT}) and NIL(${NIL_1})`, function( done ) {
        request( app )
        .get( '/city/tweets/district' )
        .query( {
          startDate: START_DATE,
          lang: LANG_IT,
          'nil_ID': NIL_1,
        } )
        .expect( 'Content-Type', /json/ )
        .expect( 200 )
        .expect( function( res ) {
          expect( res.body ).to.exist;
          let body = res.body;

          // Nils
          expect( body ).to.have.property( 'nils' );
          let nils = body.nils;
          expect( nils ).to.have.length( 1 );

          // Nil 1
          let nil1 = nils[ 0 ];
          expect( nil1 ).to.exist;
          expect( nil1 ).to.have.property( 'value', 1 );
          expect( nil1 ).to.have.property( 'nil', NIL_1 );
          expect( nil1.langs ).to.have.property( LANG_IT, 1 );
        } )
        .end( done );
      } );

      it( `should return 1 tweet for lang(${LANG_OTHER}) and NIL(${NIL_1})`, function( done ) {
        request( app )
        .get( '/city/tweets/district' )
        .query( {
          startDate: START_DATE,
          lang: LANG_OTHER,
          'nil_ID': NIL_1,
        } )
        .expect( 'Content-Type', /json/ )
        .expect( 200 )
        .expect( function( res ) {
          expect( res.body ).to.exist;
          let body = res.body;

          // Nils
          expect( body ).to.have.property( 'nils' );
          let nils = body.nils;
          expect( nils ).to.have.length( 1 );

          // Nil 1
          let nil1 = nils[ 0 ];
          expect( nil1 ).to.exist;
          expect( nil1 ).to.have.property( 'value', 1 );
          expect( nil1 ).to.have.property( 'nil', NIL_1 );
          expect( nil1.langs ).to.have.property( 'fr', 1 );
        } )
        .end( done );
      } );


      it( `should return 2 tweet for lang(${LANG_IT})`, function( done ) {
        request( app )
        .get( '/city/tweets/district' )
        .query( {
          startDate: START_DATE,
          lang: LANG_IT,
        } )
        .expect( 'Content-Type', /json/ )
        .expect( 200 )
        .expect( function( res ) {
          expect( res.body ).to.exist;
          let body = res.body;

          // Nils
          expect( body ).to.have.property( 'nils' );
          let nils = body.nils;
          expect( nils ).to.have.length( NUM_NILS );

          let total = 0;
          // NIL 1
          let nil1 = nils.filter( d => d.nil===1 )[ 0 ];
          expect( nil1 ).to.exist;
          expect( nil1 ).to.have.property( 'nil', NIL_1 );
          expect( nil1.langs ).to.have.property( LANG_IT, 1 );
          total += nil1.value;
          // NIL 2
          let nil2 = nils.filter( d => d.nil===2 )[ 0 ];
          expect( nil2 ).to.exist;
          expect( nil2 ).to.have.property( 'nil', 2 );
          expect( nil2.langs ).to.have.property( LANG_IT, 1 );
          total += nil2.value;

          expect( total ).to.be.eql( 2 );
        } )
        .end( done );
      } );

      it( `should return 2 tweet for lang(${LANG_OTHER})`, function( done ) {
        request( app )
        .get( '/city/tweets/district' )
        .query( {
          startDate: START_DATE,
          lang: LANG_OTHER,
        } )
        .expect( 'Content-Type', /json/ )
        .expect( 200 )
        .expect( function( res ) {
          expect( res.body ).to.exist;
          let body = res.body;

          // Nils
          expect( body ).to.have.property( 'nils' );
          let nils = body.nils;
          expect( nils ).to.have.length( NUM_NILS );

          let total = 0;
          // NIL 1
          let nil1 = nils.filter( d => d.nil===1 )[ 0 ];
          expect( nil1 ).to.exist;
          expect( nil1 ).to.have.property( 'nil', NIL_1 );
          expect( nil1.langs ).to.have.property( 'fr', 1 );
          total += nil1.value;
          // NIL 2
          let nil2 = nils.filter( d => d.nil===2 )[ 0 ];
          expect( nil2 ).to.exist;
          expect( nil2 ).to.have.property( 'nil', 2 );
          expect( nil2.langs ).to.have.property( 'fr', 1 );
          total += nil1.value;

          expect( total ).to.be.eql( 2 );
        } )
        .end( done );
      } );



    } );





    // Text
    describe( 'text', function() {

      it( `should return 1 tweet for lang(${LANG_IT}) and NIL(${NIL_1})`, function( done ) {
        request( app )
        .get( '/city/tweets/text' )
        .query( {
          startDate: START_DATE,
          lang: LANG_IT,
          limit: 2,
          'nil_ID': NIL_1,
        } )
        .expect( 'Content-Type', /json/ )
        .expect( 200 )
        .expect( function( res ) {
          expect( res.body ).to.exist;
          let body = res.body;

          // Nils
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

      it( `should return 0 tweet for sensitive content lang(${LANG_IT}) and NIL(${NIL_2})`, function( done ) {
        request( app )
        .get( '/city/tweets/text' )
        .query( {
          startDate: START_DATE,
          lang: LANG_IT,
          limit: 2,
          'nil_ID': NIL_2,
        } )
        .expect( 'Content-Type', /json/ )
        .expect( 200 )
        .expect( function( res ) {
          expect( res.body ).to.exist;
          let body = res.body;

          // Nils
          expect( body ).to.have.property( 'tweets' );
          let tweets = body.tweets;
          expect( tweets ).to.have.length( 0 );
        } )
        .end( done );
      } );

      it( `should return 0 tweet for sensitive content lang(${LANG_OTHER}) and NIL(${NIL_2})`, function( done ) {
        request( app )
        .get( '/city/tweets/text' )
        .query( {
          startDate: START_DATE,
          lang: LANG_OTHER,
          limit: 2,
          'nil_ID': NIL_2,
        } )
        .expect( 'Content-Type', /json/ )
        .expect( 200 )
        .expect( function( res ) {
          expect( res.body ).to.exist;
          let body = res.body;

          // Nils
          expect( body ).to.have.property( 'tweets' );
          let tweets = body.tweets;
          expect( tweets ).to.have.length( 0 );
        } )
        .end( done );
      } );

    } );




    // Timeline
    describe( 'timeline', function() {

      it( `should get correct montly counts for lang(${LANG_IT})`, function( done ) {
        request( app )
        .get( '/city/tweets/timeline' )
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

          // Nils
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
        .get( '/city/tweets/timeline' )
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

          // Nils
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