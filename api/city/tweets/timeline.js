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

// Module variables declaration

// Module functions declaration
function* getTweetsPerMonth( collectionName, year, month, filter ) {
  let start = moment.utc( { year, month } ).startOf( 'month' );
  let end = moment.utc( { year, month } ).endOf( 'month' );

  let query = _.assign( {}, filter, {
    date: {
      $gte: start.toDate(),
      $lte: end.toDate(),
    }
  } );

  let count = yield db.count( collectionName, query );

  return count;
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
    language: language,
  };


  // Create query filter
  let filter = {
    provider: 'twitter',
  };

  // Filter by language
  filter.lang = language;
  if( language==='other' ) {
    filter.lang = {
      $nin: [ 'it', 'en', 'und' ],
    };
  }

  let timeline = [];

  // For each month count the tweets
  let startDate = start.clone();
  while( startDate.isBefore( end ) ) {
    let month = startDate.month();
    let year = startDate.year();

    debug( 'Get tweets count for %d-%d', year, month+1 );
    let monthlyCount = yield getTweetsPerMonth( COLLECTION, year, month, filter );

    timeline.push( {
      date: startDate.format( 'YYYY-MM' ),
      value: monthlyCount,
    } );

    startDate.add( 1, 'month' );
  }

  response.timeline = timeline;


  ctx.body = response;
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = co.wrap( getTimeline );


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78