'use strict';
// Load system modules

// Load modules
let co = require( 'co' );
let _ = require( 'lodash' );
let Boom = require( 'boom' );
let debug = require( 'debug' )( 'UrbanScope:server:api:city:calls:total' );

// Load my modules
let db = require( 'db-utils' );

// Constant declaration
const COLLECTION = 'calls';
const DATE_FORMAT = require( '../../../config/' ).dateFormat;

// Module variables declaration

// Module functions declaration
function getCountries( countries ) {
  let countriesMap = _( countries )
  .groupBy( 'country' )
  .mapValues( data => {
    let callIn = _.sum( data, 'callIn' );
    let callOut = _.sum( data, 'callOut' );

    return {
      in: callIn,
      out: callOut,
      total: callIn + callOut,
    };
  } )
  .value();

  return countriesMap;
}
function* total( ctx ) {
  debug( 'Requested total' );

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

  // Get the calls
  let pipeline = [];
  // Add filter
  pipeline.push( {
    $match: filter,
  } );
  // Add grouping by year-month
  pipeline.push( {
    $group: {
      _id: {
        y: { $year: '$date' },
        m: { $month: '$date' },
      },
      countries: {
        $push: '$$ROOT',
      },
    }
  } );
  // Rename the fields
  pipeline.push( {
    $project: {
      _id: 0,
      date: '$_id',
      countries: 1,
    }
  } );

  // Start the pipeline
  let calls = yield db
  .aggregate( COLLECTION, pipeline )
  .toArray();

  // Parse the calls to get the results
  response.calls = _( calls )
  .map( data => {
    let year = data.date.y;
    let month = data.date.m;

    // Zeropad
    month = month<9? '0'+month : month;

    return {
      date: year + '-' + month,
      countries: getCountries( data.countries ),
    };
  } )
  .value();

  ctx.body = response;
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = co.wrap( total );


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78