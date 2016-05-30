'use strict';
// Load system modules

// Load modules
const co = require( 'co' );
const debug = require( 'debug' )( 'UrbanScope:server:api:middlewares:cache' );

// Load my modules

// Constant declaration
const MAX_AGE = 60*30; // 5 min
const PREFIX = 'cache:';

// Module variables declaration

// Module functions declaration
function hashFn( ctx ) {
  return PREFIX+ctx.request.url;
}
function get( redis, key ) {
  return redis
  .get( key )
  .then( value => {
    if( value ) return JSON.parse( value );
  } )
}
function set( redis, key, value, maxAge ) {
  if( typeof value!=='string' ) {
    value = JSON.stringify( value );
  }

  if( maxAge<Infinity ) {
    return redis
    .set( key, value, 'EX', maxAge );
  } else {
    return redis
    .set( key, value );
  }

}
function initCache( options ) {
  options = options || {};
  const maxAge = options.maxAge || MAX_AGE;
  const hash = options.hash || hashFn;

  return co.wrap( function* cacheMiddleware( ctx, next ) {
    debug( 'Check cache hit' );
    const redis = ctx.app.context.redis;

    const key = hash( ctx );
    const val = yield get( redis, key );

    if( val ) {
      debug( 'Cache hit' );
      ctx.cached = true;
      ctx.body = val;
    } else {
      debug( 'Cache miss, wait for the upstream respose' );

      yield next();

      if( !ctx.body ) return;

      debug( 'Add cache entry' );
      yield set( redis, key, ctx.body, ctx.maxAge || maxAge );
    }
  } );
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = initCache;


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78