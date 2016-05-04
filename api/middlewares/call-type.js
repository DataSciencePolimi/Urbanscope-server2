'use strict';
// Load system modules

// Load modules
const Boom = require( 'boom' );
const _ = require( 'lodash' );
const debug = require( 'debug' )( 'UrbanScope:server:api:middlewares:call-type' );

// Load my modules

// Constant declaration
const VALID_VALUES = [
  'in',
  'out',
];

// Module variables declaration

// Module functions declaration
function getCallType( ctx, next ) {
  debug( 'Get call type' );

  const qs = ctx.request.query;
  let type = qs.type || VALID_VALUES[ 0 ];
  type = type.toLowerCase();

  if( !_.includes( VALID_VALUES, type ) ) {
    const message = '"type" parameter must be one of: '+VALID_VALUES.join( ',' );
    throw Boom.badRequest( message );
  }
  ctx.callType = type;

  debug( 'Call type is: %s', ctx.callType );

  return next();
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = getCallType;


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78