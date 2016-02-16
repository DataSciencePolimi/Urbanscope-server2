'use strict';
// Load system modules

// Load modules
let _ = require( 'lodash' );
let Boom = require( 'boom' );
let debug = require( 'debug' )( 'UrbanScope:server:api:middlewares:municipality' );

// Load my modules

// Constant declaration
const MUNICIPALITIES = require( '../../config/milan_municipalities.json' );
const DEFAULT_MUNICIPALITY = _( MUNICIPALITIES ).map( 'properties.PRO_COM' ).first();

// Module variables declaration

// Module functions declaration
function getParam( ctx ) {
  debug( 'Get municipality param' );

  let qs = ctx.request.query;
  let municipality = qs.municipality_ID;

  return municipality;
}
function getMunicipalities( ctx, next ) {
  debug( 'Get municipalities' );

  let municipalities = getParam( ctx );

  if( municipalities ) {
    municipalities = municipalities
    .split( ',' )
    .filter( value => value.length )
    .map( municipality => parseInt( municipality, 10 ) );

    // Check each municipality
    for( let municipality of municipalities ) {
      if( isNaN( municipality ) || municipality<=0 ) {
        throw Boom.badRequest( `Municipality "${municipality}" not a positive number` );
      }
    }
  } else {
    municipalities = [];
  }

  ctx.municipalities = municipalities;

  return next();
}
function getMunicipality( ctx, next ) {
  debug( 'Get municipality' );

  let municipality = getParam( ctx ) || DEFAULT_MUNICIPALITY;

  ctx.municipality = parseInt( municipality, 10 );

  return next();
}
function parseMunicipalityParam( multi ) {
  if( multi ) {
    return getMunicipalities;
  } else {
    return getMunicipality;
  }
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = parseMunicipalityParam;


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78