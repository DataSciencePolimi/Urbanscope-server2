'use strict';
// Load system modules

// Load modules
const co = require( 'co' );
const _ = require( 'lodash' );
const Boom = require( 'boom' );
const db = require( 'db-utils' );
const debug = require( 'debug' )( 'UrbanScope:server:api:municipality:tweets:timeline2' );

// Load my modules
const getDateBetween = require( '../../../utils/get-between' );

// Constant declaration
const DATE_FORMAT = require( '../../../config/' ).dateFormat;
const CACHE_MAX_AGE = 60*60*24*1; // 1 dd
const TIMELINE = 'timeline';
const OUT_DATE_FORMAT = 'YYYY-MM';

// Module variables declaration

// Module functions declaration
function formatTimelineData( timeline ) {

  return _( timeline )
  .map( e => {
    const month = e.month < 10 ? '0'+e.month : e.month;
    return {
      date: `${e.year}-${month}`,
      value: e.value,
    }
  } )
  .groupBy( 'date' )
  .mapValues( values => _.sumBy( values, 'value' ) )
  .map( ( v, k ) => ( {
    date: k,
    value: v,
  } ) )
  .value();
}
function getTimelineData( filter ) {
  return db
  .find( TIMELINE, filter )
  .project( {
    _id: 0,
    year: 1,
    month: 1,
    value: 1,
  } )
  .sort( {
    year: 1,
    month: 1,
  } )
  .toArray()
  .then( formatTimelineData );
}
function* getTimeline( ctx ) {
  // Cache MAX_AGE
  ctx.maxAge = CACHE_MAX_AGE;

  debug( 'Requested timeline' );

  const start = ctx.startDate;
  const end = ctx.endDate;
  const language = ctx.language;


  if( start.isAfter( end ) ) {
    throw Boom.badRequest( 'Start date after end date' );
  }

  const response = {
    startDate: start.format( DATE_FORMAT ),
    endDate: end.format( DATE_FORMAT ),
    lang: language,
  };

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

  const timelineData = yield getTimelineData( filter );

  // Check that all months are present
  const startDate = start.clone();
  while( startDate.isBefore( end ) ) {
    const month = startDate.month();
    const year = startDate.year();

    debug( 'Get tweets count for %d-%d', year, month+1 );
    const date = startDate.format( OUT_DATE_FORMAT );
    if( !_.find( timelineData, { date: date } ) ) {
      // Fill gap
      timelineData.push( {
        date: date,
        value: 0,
      } )
    }

    startDate.add( 1, 'month' );
  }

  response.timeline = _.orderBy( timelineData, 'date' );

  // Set response
  ctx.body = response;
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = co.wrap( getTimeline );


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78