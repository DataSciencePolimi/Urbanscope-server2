'use strict';
// Load system modules

// Load modules
const co = require( 'co' );
const _ = require( 'lodash' );
const Boom = require( 'boom' );
const db = require( 'db-utils' );
const debug = require( 'debug' )( 'UrbanScope:server:api:municipality:tweets:district2' );

// Load my modules
const getDateBetween = require( '../../../utils/get-between' );

// Constant declaration
const DATE_FORMAT = require( '../../../config/' ).dateFormat;
const MUNICIPALITIES = require( '../../../config/milan_municipalities.json' );
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
      municipality: Number( k ),
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
  const municipalities = ctx.municipalities;


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
    type: 'municipality',
  };
  filter.$or = getDateBetween( start, end );


  // Filter by language
  if( language==='other' ) {
    filter.lang = {
      $nin: [ 'it', 'en', 'und', null ],
    };
  }


  // Add selected municipalities property to the response
  if( municipalities.length>0 ) {
    filter.id = { $in: municipalities };
  } else {
    const allMunicipalities = _.map( MUNICIPALITIES, 'properties.PRO_COM' );
    filter.id = { $in: allMunicipalities };
  }

  const data = yield getTimelineData( filter );

  response.selectedMunicipalities = filter.id[ '$in' ];
  response.municipalities = data;

  // Set response
  ctx.body = response;
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = co.wrap( district );


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78