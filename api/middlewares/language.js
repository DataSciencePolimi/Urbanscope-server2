'use strict';
// Load system modules

// Load modules
let Boom = require( 'boom' );
let _ = require( 'lodash' );
let debug = require( 'debug' )( 'Api:middlewares:language' );

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

  let qs = ctx.request.query;
  let lang = qs.lang || VALID_VALUES[ 0 ];
  lang = lang.toLowerCase();

  if( !_.includes( VALID_VALUES, lang ) ) {
    let message = '"lang" parameter must be one of: '+VALID_VALUES.join( ',' );
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