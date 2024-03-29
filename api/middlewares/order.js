'use strict';
// Load system modules

// Load modules
const _ = require( 'lodash' );
const Boom = require( 'boom' );
const debug = require( 'debug' )( 'UrbanScope:server:api:middlewares:order' );

// Load my modules

// Constant declaration
const VALID_VALUES = [
  'total',
  'in',
  'out',
];

// Module variables declaration

// Module functions declaration
function getOrder( ctx, next ) {
  debug( 'Get orderBy' );

  const qs = ctx.request.query;
  let orderBy = qs.orderBy || VALID_VALUES[ 0 ];
  orderBy = orderBy.toLowerCase();

  if( !_.includes( VALID_VALUES, orderBy ) ) {
    const message = '"orderBy" parameter must be one of: '+VALID_VALUES.join( ',' );
    throw Boom.badRequest( message );
  }

  debug( 'Order by is: %s', orderBy );
  ctx.orderBy = orderBy;

  return next();
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = getOrder;


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78