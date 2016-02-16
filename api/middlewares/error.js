'use strict';
// Load system modules

// Load modules
let co = require( 'co' );
let Boom = require( 'boom' );
let debug = require( 'debug' )( 'UrbanScope:server:api:middlewares:error' );

// Load my modules

// Constant declaration

// Module variables declaration

// Module functions declaration
function* handleError( ctx, next ) {
  try {
    yield next();
  } catch( err ) {
    let myErr = Boom.wrap( err );

    debug( 'API error', myErr );

    ctx.status = myErr.output.statusCode;
    ctx.body = myErr.output.payload;
  }
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = co.wrap( handleError );


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78