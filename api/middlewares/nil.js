'use strict';
// Load system modules

// Load modules
let Boom = require( 'boom' );
let debug = require( 'debug' )( 'Api:middlewares:nils' );

// Load my modules

// Constant declaration

// Module variables declaration

// Module functions declaration
function getParam( ctx ) {
  debug( 'Get nil param' );

  let qs = ctx.request.query;
  let nil = qs.nil_ID;

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
    for( let nil of nils ) {
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

  let nil = getParam( ctx ) || 1;

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