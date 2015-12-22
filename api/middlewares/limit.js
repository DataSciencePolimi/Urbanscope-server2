'use strict';
// Load system modules

// Load modules
let Boom = require( 'boom' );
let debug = require( 'debug' )( 'Api:middlewares:limit' );

// Load my modules

// Constant declaration

// Module variables declaration

// Module functions declaration
function getLimit( ctx, next ) {
  debug( 'Get limit' );

  let qs = ctx.request.query;
  let limit = qs.limit || '100';
  try {
    limit = parseInt( limit, 10 );
  } catch( err ) {
    throw Boom.badRequest( err.message );
  }

  if( isNaN( limit ) ) {
    throw Boom.badRequest( '"limit" value is invalid' )
  } else if( limit<=0 ) {
    throw Boom.badRequest( '"limit" must be greater than 0' )
  }

  ctx.limit = limit;

  return next();
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = getLimit;


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78