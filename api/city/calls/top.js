'use strict';
// Load system modules

// Load modules
let co = require( 'co' );
let _ = require( 'lodash' );
let Boom = require( 'boom' );
let debug = require( 'debug' )( 'UrbanScope:server:api:city:calls:top' );

// Load my modules
let db = require( 'db-utils' );

// Constant declaration
const COLLECTION = 'calls';
const DATE_FORMAT = require( '../../../config/' ).dateFormat;

// Module variables declaration

// Module functions declaration
function* top( ctx ) {
  debug( 'Requested top' );

  let start = ctx.startDate;
  let end = ctx.endDate;
  let limit = ctx.limit;
  let orderBy = ctx.orderBy;

  if( start.isAfter( end ) ) {
    throw Boom.badRequest( 'Start date after end date' );
  }

  let response = {
    startDate: start.format( DATE_FORMAT ),
    endDate: end.format( DATE_FORMAT ),
    limit: limit,
    orderBy: orderBy,
  };


  // Create query filter
  let filter = {
    date: {
      $gte: start.toDate(),
      $lte: end.toDate(),
    },
  };

  // Get the calls
  let pipeline = [];
  // Add filter
  pipeline.push( {
    $match: filter,
  } );
  // Add grouping by year-month
  pipeline.push( {
    $group: {
      _id: '$country',
      in: { $sum: { $add: '$callIn' } },
      out: { $sum: { $add: '$callOut' } },
      total: { $sum: { $add: [ '$callOut', '$callIn' ] } },
    }
  } );
  // Sort by the specified field
  pipeline.push( {
    $sort: {
      [orderBy]: -1
    }
  } );
  // Limit the results
  pipeline.push( {
    $limit: limit,
  } );
  // Rename "_id"
  pipeline.push( {
    $project: {
      country: '$_id',
      in: 1,
      out: 1,
      total: 1,
      _id: 0,
    },
  } );

  // Start the pipeline
  let calls = yield db
  .aggregate( COLLECTION, pipeline )
  .toArray();

  // Parse the calls to get the results
  response.calls = calls;

  ctx.body = response;
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = co.wrap( top );


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78