'use strict';
// Load system modules

// Load modules
const Boom = require( 'boom' );
const _ = require( 'lodash' );
const debug = require( 'debug' )( 'UrbanScope:server:api:middlewares:language' );

// Load my modules

// Constant declaration
const VALID_VALUES = [
  'it',
  'en',
  'other',
];

// Module variables declaration

// Module functions declaration
function getLanguage( ctx, next ) {
  debug( 'Get language' );

  const qs = ctx.request.query;
  let lang = qs.lang || VALID_VALUES[ 0 ];
  lang = lang.toLowerCase();

  if( !_.includes( VALID_VALUES, lang ) ) {
    const message = '"lang" parameter must be one of: '+VALID_VALUES.join( ',' );
    throw Boom.badRequest( message );
  }
  ctx.language = lang;

  debug( 'Language is: %s', ctx.language );

  return next();
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = getLanguage;


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78