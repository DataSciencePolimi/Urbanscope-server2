'use strict';
// Load system modules

// Load modules
let co = require( 'co' );
let debug = require( 'debug' )( 'UrbanScope:server:api:middlewares:metadata' );

// Load my modules

// Constant declaration

// Module variables declaration

// Module functions declaration
function* setMetadata( ctx, next ) {
  debug( 'Set request metadata' );

  // Init time
  let start = Date.now();

  // Wait for all to complete
  yield next();
  debug( 'After all' );

  // Get request time
  let ms = Date.now() - start;
  debug( '%s took %d ms', ctx.path, ms );

  let metadata = {
    completedIn: ms,
    fromCache: ctx.cached,
  };

  if( !ctx.body ) {
    ctx.body = {};
  }

  ctx.body.metadata = metadata;
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = co.wrap( setMetadata );


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78