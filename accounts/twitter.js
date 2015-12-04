'use strict';
// Load system modules
let querystring = require( 'querystring' );

// Load modules
let _ = require( 'lodash' );
let Twit = require( 'twit' );
let Promise = require( 'bluebird' );
let debug = require( 'debug' )( 'Accounts:Twitter' );
// let trace = require( 'memon' );

// Load my modules
let Account = require( './base' );

// Constant declaration
const WINDOW = 1000*60*15; // 15 Minutes
const DEFAULT_PARAMS = {
  count: 100,
  /* eslint-disable camelcase */
  results_per_page: 100,
  result_type: 'recent',
  include_entities: 1,
  /* eslint-enable camelcase */
};

// Module variables declaration
let i = 1;

// Module functions declaration

// Module class declaration
class TwitterAccount extends Account {
  constructor( key ) {
    super( 'Twitter '+(i++), key );

    debug( 'Done' );
  }

  // Overrides
  getApi( key ) {
    debug( '%s get api for', this, key );

    let api = new Twit( key );

    return Promise.promisifyAll( api, {
      multiArgs: true,
    } );
  }

  // Methods
  loop( data ) {
    let tweets = data.statuses;
    debug( '%s got %d tweets', this, tweets.length );


    if( tweets.length===0 ) {
      debug( '%s no more tweets', this );
      return null;
    } else {
      // trace( this.toString()+' send tweets' );
      this.send( tweets );
    }

    let metadata = data.search_metadata;
    debug( '%s got meta', this, metadata );
    if( metadata.next_results ) {
      let params = metadata.next_results.slice( 1 );
      let query = querystring.parse( params );
      debug( '%s next: ', this, query );

      // trace( this.toString()+' next page' );
      return this.get( query );
    }
  }
  get( query ) {
    query = _.assign( {}, DEFAULT_PARAMS, query );

    debug( '%s making query', this, query );
    // trace( this.toString()+' start query' );

    return this.api
    .getAsync( 'search/tweets', query )
    .bind( this )
    .spread( this.loop )
    .catch( err => {
      if( err.code===88 ) {
        debug( '%s rate limit', this );
        // trace( this.toString()+' rate limit' );

        // On rate-limit repeat the request
        return Promise
        .delay( WINDOW )
        // .tap( ()=> trace( this.toString()+' ready' ) )
        // Redo the same query
        .then( () => this.get( query ) );
      }

      debug( '%s error', this, err, err.stack );
      // trace( this.toString()+' error', err.message );
      // On error do not repeat the request
    } )

  }
  geo( points ) {
    // trace( this.toString()+' get point' );

    let point = points.pop();
    // No more points, stream finished
    if( !point ) {
      debug( '%s no more valid points, end', this );
      // trace( this.toString()+' done points' );
      this.end();
      return;
    }

    debug( '%s query for point(%d): ', this, points.length, point );

    let radius = point.radius/1000; // convert in km

    let geocode = 'geocode:';
    geocode += point.latitude+',';
    geocode += point.longitude+',';
    geocode += radius+'km';
    debug( '%s geocode: "%s"', this, geocode );

    this.get( {
      q: geocode,
    } )
    .then( ()=> { this.geo( points ); } );
  }
}


// Module initialization (at first load)

// Module exports
module.exports = TwitterAccount;

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78