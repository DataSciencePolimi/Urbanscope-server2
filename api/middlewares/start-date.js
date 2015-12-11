'use strict';
// Load system modules

// Load modules
let Boom = require( 'boom' );
let moment = require( 'moment' );
let debug = require( 'debug' )( 'Api:middlewares:start-date' );

// Load my modules

// Constant declaration
const DATE_FORMAT = require( '../../config/' ).dateFormat;

// Module variables declaration

// Module functions declaration
function getStartDate( ctx, next ) {
  debug( 'Get start date' );

  let qs = ctx.request.query;
  let start = qs.startDate;

  // Use passed date or now
  if( start ) {
    start = moment.utc( start, DATE_FORMAT, 'en', true );
  } else {
    start = moment.utc().subtract( 1, 'month' );
  }

  if( !start.isValid() ) {
    let message = 'Invalid "startDate" format, please stick to '+DATE_FORMAT;
    throw Boom.badRequest( message );
  }


  // Go to the start of the day
  start.startOf( 'day' );
  debug( 'Start date: %s', start.format( DATE_FORMAT ) );

  ctx.startDate = start;

  return next();
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = getStartDate;


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78