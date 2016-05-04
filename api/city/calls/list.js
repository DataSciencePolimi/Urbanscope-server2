'use strict';
// Load system modules

// Load modules
const co = require( 'co' );
const _ = require( 'lodash' );
const Boom = require( 'boom' );
const moment = require( 'moment' );
const debug = require( 'debug' )( 'UrbanScope:server:api:city:calls:list' );

// Load my modules
const db = require( 'db-utils' );

// Constant declaration
const COLLECTION = 'calls';
const DATE_FORMAT = require( '../../../config/' ).dateFormat;

// Module variables declaration

// Module functions declaration
function* timeline( ctx ) {
  debug( 'Requested timeline' );

  const start = ctx.startDate;
  const end = ctx.endDate;
  const limit = ctx.limit;


  if( start.isAfter( end ) ) {
    throw Boom.badRequest( 'Start date after end date' );
  }

  const response = {
    startDate: start.format( DATE_FORMAT ),
    endDate: end.format( DATE_FORMAT ),
  };


  // Create query filter
  const filter = {
    date: {
      $gte: start.toDate(),
      $lte: end.toDate(),
    },
  };

  // Get the calls
  const calls = yield db
  .find( COLLECTION, filter )
  .limit( limit )
  .toArray();

  // Parse the calls to get the results
  response.list = _( calls )
  .map( data => {
    const date = moment.utc( data.date );

    return {
      date: date.format( DATE_FORMAT ),
      in: data.callIn,
      out: data.callOut,
      country: data.country,
    };
  } )
  .value();

  ctx.body = response;
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = co.wrap( timeline );


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78