'use strict';
// Load system modules

// Load modules
const co = require( 'co' );
const _ = require( 'lodash' );
const Boom = require( 'boom' );
const db = require( 'db-utils' );
const debug = require( 'debug' )( 'UrbanScope:server:api:city:calls:district' );

// Load my modules

// Constant declaration
const COLLECTION = 'calls';
const DATE_FORMAT = require( '../../../config/' ).dateFormat;

// Module variables declaration

// Module functions declaration
function convertToNilObject( field, calls, nil ) {
  nil = Number( nil ); // force conversion to Number

  // Get countries sum
  const countries = _( calls )
  .groupBy( 'country' )
  .mapValues( data => _.sum( data, field ) )
  .value();

  // Get total
  const total = _.sum( calls, field );

  return {
    nil,
    value: total,
    countries,
  };
}
function* district( ctx ) {
  debug( 'Requested district' );

  const start = ctx.startDate;
  const end = ctx.endDate;
  const type = ctx.callType;
  const nils = ctx.nils;


  if( start.isAfter( end ) ) {
    throw Boom.badRequest( 'Start date after end date' );
  }

  const response = {
    startDate: start.format( DATE_FORMAT ),
    endDate: end.format( DATE_FORMAT ),
    type: type,
  };


  // Create query filter
  const filter = {
    date: {
      $gte: start.toDate(),
      $lte: end.toDate(),
    },
  };

  // Add selected nils property to the response
  if( nils.length ) {
    response.selectedNils = nils;
    filter.nil = { $in: nils };
  } else {
    response.selectedNils = 'all';
  }

  // Get the field on which to do summations
  const callField = _.camelCase( 'call '+ type );

  // Get all calls
  const calls = yield db.find( COLLECTION, filter ).toArray();

  const convertToNil = _.partial( convertToNilObject, callField );
  // Parse the calls to get the results
  response.nils = _( calls )
  .groupBy( 'nil' )
  .map( convertToNil )
  .value();

  ctx.body = response;
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = co.wrap( district );


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78