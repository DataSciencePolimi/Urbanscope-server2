'use strict';
// Load system modules

// Load modules
let co = require( 'co' );
let _ = require( 'lodash' );
let Boom = require( 'boom' );
let moment = require( 'moment' );
let debug = require( 'debug' )( 'Api:city:tweets:timeline' );

// Load my modules
let db = require( '../../../db' );

// Constant declaration
const COLLECTION = 'posts';
const DATE_FORMAT = require( '../../../config/' ).dateFormat;
const OUT_DATE_FORMAT = 'YYYY-MM';

// Module variables declaration

// Module functions declaration
function getTweetsPerMonth( collectionName, year, month, filter ) {
  let start = moment.utc( { year, month } ).startOf( 'month' );
  let end = moment.utc( { year, month } ).endOf( 'month' );

  let query = _.assign( {}, filter, {
    date: {
      $gte: start.toDate(),
      $lte: end.toDate(),
    }
  } );

  return db.count( collectionName, query );
}
function* getTimeline( ctx ) {
  debug( 'Requested timeline' );

  let start = ctx.startDate;
  let end = ctx.endDate;
  let language = ctx.language;


  if( start.isAfter( end ) ) {
    throw Boom.badRequest( 'Start date after end date' );
  }

  let response = {
    startDate: start.format( DATE_FORMAT ),
    endDate: end.format( DATE_FORMAT ),
    lang: language,
  };


  // Create query filter
  let filter = {
    $or: [
      { provider: 'twitter' },
      { source: 'twitter' },
    ],
    nil: { $ne: null },
  };

  // Filter by language
  filter.lang = language;
  if( language==='other' ) {
    filter.lang = {
      $nin: [ 'it', 'en', 'und', null ],
    };
  }

  let actions = {};

  // For each month count the tweets
  let startDate = start.clone();
  while( startDate.isBefore( end ) ) {
    let month = startDate.month();
    let year = startDate.year();

    debug( 'Get tweets count for %d-%d', year, month+1 );
    let key = startDate.format( OUT_DATE_FORMAT );
    actions[ key ] = getTweetsPerMonth( COLLECTION, year, month, filter );

    startDate.add( 1, 'month' );
  }

  let responses = yield actions;

  response.timeline = _.map( responses, ( count, date ) => {
    return {
      date,
      value: count,
    };
  } );


  ctx.body = response;
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = co.wrap( getTimeline );


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78