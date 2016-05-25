'use strict';
// Load system modules

// Load modules
const co = require( 'co' );
const _ = require( 'lodash' );
const Boom = require( 'boom' );
const db = require( 'db-utils' );
const debug = require( 'debug' )( 'UrbanScope:server:api:city:tweets:district2' );

// Load my modules

// Constant declaration
const DATE_FORMAT = require( '../../../config/' ).dateFormat;
const NILS = require( '../../../config/milan_nils.json' );
const CACHE_MAX_AGE = 60*60*24*1; // 1 dd
const TIMELINE = 'timeline';

// Module variables declaration

// Module functions declaration
function formatTimelineData( timeline ) {
  return _( timeline )
  .groupBy( 'id' )
  .mapValues( values => {
    return _( values )
    .groupBy( 'lang' )
    .mapValues( data => _.sumBy( data, 'value' ) )
    .value();
  } )
  .map( ( v, k ) => {
    return {
      nil_id: Number( k ),
      value: _( v ).map().sumBy(),
      langs: v,
    };
  } )
  .value();
}
function getTimelineData( filter ) {
  return db
  .find( TIMELINE, filter )
  .project( {
    _id: 0,
    type: 0,
  } )
  .sort( {
    id: 1,
  } )
  .toArray()
  .then( formatTimelineData );
}

function* district( ctx ) {
  // Cache MAX_AGE
  ctx.maxAge = CACHE_MAX_AGE;

  debug( 'Requested district' );

  const start = ctx.startDate;
  const end = ctx.endDate;
  const language = ctx.language;
  const nils = ctx.nils;


  if( start.isAfter( end ) ) {
    throw Boom.badRequest( 'Start date after end date' );
  }

  const response = {
    startDate: start.format( DATE_FORMAT ),
    endDate: end.format( DATE_FORMAT ),
    language: language,
  };


  // Create query filter
  const filter = {
    lang: language,
    type: 'nil',
    year: {
      $gte: start.year(),
      $lte: end.year(),
    },
    month: {
      $gte: start.month() + 1,
      $lte: end.month() + 1,
    },
  };


  // Filter by language
  if( language==='other' ) {
    filter.lang = {
      $nin: [ 'it', 'en', 'und', null ],
    };
  }


  // Add selected nils property to the response
  if( nils.length>0 ) {
    filter.id = { $in: nils };
  } else {
    const allNils = _.map( NILS, 'properties.ID_NIL' );
    filter.id = { $in: allNils };
  }

  const data = yield getTimelineData( filter );

  response.selectedNils = filter.nil[ '$in' ];
  response.nils = data;

  // Set response
  ctx.body = response;
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = co.wrap( district );


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78