'use strict';
// Load system modules

// Load modules
let co = require( 'co' );
let _ = require( 'lodash' );
let Boom = require( 'boom' );
let debug = require( 'debug' )( 'UrbanScope:server:api:city:calls:timeline' );

// Load my modules
let db = require( 'db-utils' );

// Constant declaration
const COLLECTION = 'calls';
const DATE_FORMAT = require( '../../../config/' ).dateFormat;

// Module variables declaration

// Module functions declaration
function* timeline( ctx ) {
  debug( 'Requested timeline' );

  let start = ctx.startDate;
  let end = ctx.endDate;


  if( start.isAfter( end ) ) {
    throw Boom.badRequest( 'Start date after end date' );
  }

  let response = {
    startDate: start.format( DATE_FORMAT ),
    endDate: end.format( DATE_FORMAT ),
  };


  // Create query filter
  let filter = {
    date: {
      $gte: start.toDate(),
      $lte: end.toDate(),
    },
  };

  let pipeline = [];
  // Add filter
  pipeline.push( {
    $match: filter,
  } );
  // Add grouping by year-month
  pipeline.push( {
    $group: {
      _id: {
        year: { $year: '$date' },
        month: { $month: '$date' },
      },
      in: { $sum: { $add: '$callIn' } },
      out: { $sum: { $add: '$callOut' } },
    }
  } );

  // Start the pipeline
  let calls = yield db.aggregate( COLLECTION, pipeline ).toArray();

  // Parse the calls to get the results
  response.timeline = _( calls )
  .map( data => {
    let year = data._id.year;
    let month = data._id.month;

    return {
      date: year+'-'+month,
      in: data.in,
      out: data.out,
      total: data.in + data.out,
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