'use strict';
// Load system modules

// Load modules
const co = require( 'co' );
// const _ = require( 'lodash' );
const Boom = require( 'boom' );
const debug = require( 'debug' )( 'UrbanScope:server:api:city:calls:top' );

// Load my modules
const db = require( 'db-utils' );

// Constant declaration
const COLLECTION = 'calls';
const DATE_FORMAT = require( '../../../config/' ).dateFormat;

// Module variables declaration

// Module functions declaration
function* top( ctx ) {
  debug( 'Requested top' );

  const start = ctx.startDate;
  const end = ctx.endDate;
  const limit = ctx.limit;
  const orderBy = ctx.orderBy;

  if( start.isAfter( end ) ) {
    throw Boom.badRequest( 'Start date after end date' );
  }

  const response = {
    startDate: start.format( DATE_FORMAT ),
    endDate: end.format( DATE_FORMAT ),
    limit: limit,
    orderBy: orderBy,
  };


  // Create query filter
  const filter = {
    date: {
      $gte: start.toDate(),
      $lte: end.toDate(),
    },
  };

  // Get the calls
  const pipeline = [];
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
    },
  } );
  // Sort by the specified field
  pipeline.push( {
    $sort: {
      [orderBy]: -1,
    },
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
  const calls = yield db
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