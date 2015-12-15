'use strict';
// Load system modules

// Load modules
let Boom = require( 'boom' );
let moment = require( 'moment' );
let debug = require( 'debug' )( 'Api:middlewares:end-date' );

// Load my modules

// Constant declaration
const DATE_FORMAT = require( '../../config/' ).dateFormat;

// Module variables declaration

// Module functions declaration
function getEndDate( ctx, next ) {
  debug( 'Get end date' );

  let qs = ctx.request.query;
  let end = qs.endDate;

  // Use passed date or now
  if( end ) {
    end = moment.utc( end, DATE_FORMAT, 'en', true );
  } else {
    end = moment.utc().endOf( 'month' );
  }

  if( !end.isValid() ) {
    let message = 'Invalid "endDate" format, please stick to '+DATE_FORMAT;
    throw Boom.badRequest( message );
  }


  // Go to the end of the day
  end.endOf( 'day' );
  debug( 'End date: %s', end.format( DATE_FORMAT ) );

  ctx.endDate = end;

  return next();
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = getEndDate;


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78