'use strict';
// Load system modules

// Load modules
const _ = require( 'lodash' );
const Boom = require( 'boom' );
const debug = require( 'debug' )( 'UrbanScope:server:api:middlewares:nils' );

// Load my modules

// Constant declaration
const NILS = require( '../../config/milan_nils.json' );
const DEFAULT_NIL = _( NILS ).map( 'properties.ID_NIL' ).first();

// Module variables declaration

// Module functions declaration
function getParam( ctx ) {
  debug( 'Get nil param' );

  const qs = ctx.request.query;
  const nil = qs.nil_ID;

  return nil;
}
function getNils( ctx, next ) {
  debug( 'Get nils' );

  let nils = getParam( ctx );

  if( nils ) {
    nils = nils
    .split( ',' )
    .filter( value=> value.length )
    .map( nil=> parseInt( nil, 10 ) );

    // Check each nil
    for( const nil of nils ) {
      if( isNaN( nil ) || nil<=0 ) {
        throw Boom.badRequest( `NIL "${nil}" not a positive number` );
      }
    }
  } else {
    nils = [];
  }

  ctx.nils = nils;

  return next();
}
function getNil( ctx, next ) {
  debug( 'Get nil' );

  const nil = getParam( ctx ) || DEFAULT_NIL;

  ctx.nil = Number( nil );

  return next();
}
function parseNilParam( multi ) {
  if( multi ) {
    return getNils;
  } else {
    return getNil;
  }
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = parseNilParam;


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78