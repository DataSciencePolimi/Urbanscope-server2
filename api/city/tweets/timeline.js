'use strict';
// Load system modules

// Load modules
const co = require( 'co' );
const _ = require( 'lodash' );
const Boom = require( 'boom' );
const db = require( 'db-utils' );
const moment = require( 'moment' );
const debug = require( 'debug' )( 'UrbanScope:server:api:city:tweets:timeline' );

// Load my modules
const getTime = require( '../../../utils/time' );

// Constant declaration
const COLLECTION = 'posts';
const DATE_FORMAT = require( '../../../config/' ).dateFormat;
const OUT_DATE_FORMAT = 'YYYY-MM';
const CACHE_MAX_AGE = 60*60*24*10; // 10 dd

// Module variables declaration

// Module functions declaration
function getTweetsPerMonth( collectionName, year, month, filter, monthQueryTimes ) {
  const start = moment.utc( { year, month } ).startOf( 'month' );
  const end = moment.utc( { year, month } ).endOf( 'month' );

  const query = _.assign( {}, filter, {
    timestamp: {
      $gte: start.toDate().getTime(),
      $lte: end.toDate().getTime(),
    },
  } );

  debug( 'Requesting count for %d-%d', year, month, query );
  const startTime = getTime();
  return db
  .find( collectionName, query )
  .hint( 'Timestamp' )
  .count()
  .tap( ()=> {
    const ms = getTime( startTime );
    monthQueryTimes[ `${year}-${month+1}` ] = ms;
    debug( 'Request for %d-%d COMPLETED in %d ms', year, month, ms );
  } )
  ;
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


  // Create query filter
  const filter = {
    source: 'twitter',
    nil: { $ne: null },
  };

  // Filter by language
  filter.lang = language;
  if( language==='other' ) {
    filter.lang = {
      $nin: [ 'it', 'en', 'und', null ],
    };
  }

  const actions = {};

  // For each month count the tweets
  const monthQueryTimes = {};
  const startDate = start.clone();
  while( startDate.isBefore( end ) ) {
    const month = startDate.month();
    const year = startDate.year();

    debug( 'Get tweets count for %d-%d', year, month+1 );
    const key = startDate.format( OUT_DATE_FORMAT );
    actions[ key ] = getTweetsPerMonth( COLLECTION, year, month, filter, monthQueryTimes );

    startDate.add( 1, 'month' );
  }
  ctx.metadata.monthQueryTimes = monthQueryTimes;

  debug( 'Requesting actions' );
  let startTime = getTime();
  const responses = yield actions;
  let ms = getTime( startTime );
  ctx.metadata.query = ms;
  debug( 'Requesting actions COMPLETED in %d ms', ms );


  debug( 'Data elaboration' );
  startTime = getTime();

  const timeline = _.map( responses, ( count, date ) => {
    return {
      date,
      value: count,
    };
  } );

  response.timeline = timeline;


  ms = getTime( startTime );
  ctx.metadata.elaboration = ms;
  debug( 'Data elaboration COMPLETED in %d ms', ms );

  // Set response
  ctx.body = response;
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = co.wrap( getTimeline );


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78