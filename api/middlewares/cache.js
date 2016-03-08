'use strict';
// Load system modules

// Load modules
let co = require( 'co' );
let Redis = require( 'ioredis' );
let debug = require( 'debug' )( 'UrbanScope:server:api:middlewares:cache' );

// Load my modules

// Constant declaration
const REDIS_CONFIG = require( '../../config/redis.json' );
const MAX_AGE = 60*30; // 5 min

// Module variables declaration
let redis = new Redis( REDIS_CONFIG );

// Module functions declaration
function hashFn( ctx ) {
  return ctx.request.url;
}
function get( key ) {
  return redis
  .get( key )
  .then( value => {
    if( value ) return JSON.parse( value );
  } )
}
function set( key, value, maxAge ) {
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
  let maxAge = options.maxAge || MAX_AGE;
  let hash = options.hash || hashFn;

  return co.wrap( function* cacheMiddleware( ctx, next ) {
    debug( 'Check cache hit' );

    let key = hash( ctx );
    let val = yield get( key );

    if( val ) {
      debug( 'Cache hit' );
      ctx.cached = true;
      ctx.body = val;
    } else {
      debug( 'Cache miss, wait for the upstream respose' );

      yield next();

      if( !ctx.body ) return;

      debug( 'Add cache entry' );
      yield set( key, ctx.body, ctx.maxAge || maxAge );
    }
  } );
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = initCache;


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78