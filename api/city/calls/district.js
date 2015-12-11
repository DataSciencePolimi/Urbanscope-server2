'use strict';
// Load system modules

// Load modules
let co = require( 'co' );
let _ = require( 'lodash' );
let Boom = require( 'boom' );
let debug = require( 'debug' )( 'Api:city:calls:district' );

// Load my modules
let db = require( '../../../db' );

// Constant declaration
const COLLECTION = 'calls';
const DATE_FORMAT = require( '../../../config/' ).dateFormat;

// Module variables declaration

// Module functions declaration
function convertToNilObject( field, calls, nil ) {
  nil = Number( nil ); // force conversion to Number

  // Get countries sum
  let countries = _( calls )
  .groupBy( 'country' )
  .mapValues( data => _.sum( data, field ) )
  .value();

  // Get total
  let total = _.sum( calls, field );

  return {
    nil,
    value: total,
    countries,
  };
}
function* district( ctx ) {
  debug( 'Requested district' );

  let start = ctx.startDate;
  let end = ctx.endDate;
  let type = ctx.callType;
  let nils = ctx.nils;


  if( start.isAfter( end ) ) {
    throw Boom.badRequest( 'Start date after end date' );
  }

  let response = {
    startDate: start.format( DATE_FORMAT ),
    endDate: end.format( DATE_FORMAT ),
    type: type,
  };


  // Create query filter
  let filter = {
    date: {
      $gte: start.toDate(),
      $lte: end.toDate(),
    },
  };

  // Add selected nils property to the response
  if( nils.length ) {
    response.selectedNils = nils;
    filter.nil = { $in: nils };
  }

  // Get the field on which to do summations
  let callField = _.camelCase( 'call '+ type );

  // Get all calls
  let calls = yield db.find( COLLECTION, filter ).toArray();

  let convertToNil = _.partial( convertToNilObject, callField );
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