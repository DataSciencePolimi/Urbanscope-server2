'use strict';
// Load system modules

// Load modules
const debug = require( 'debug' )( 'UrbanScope:utils:between' );

// Load my modules

// Constant declaration

// Module variables declaration

// Module functions declaration
function getDateBetween( start, end ) {
  const conditions = [];

  if( start.year()!==end.year() ) {
    conditions.push( {
      year: {
        $gt: start.year(),
        $lt: end.year(),
      }
    } );
    conditions.push( {
      year: start.year(),
      month: { $gt: start.month() + 1 },
    } );
    conditions.push( {
      year: end.year(),
      month: { $lt: end.month() + 1 },
    } );
  } else {
    conditions.push( {
      year: start.year(),
      month: {
        $gte: start.month() + 1,
        $lte: end.month() + 1,
      },
    } );
  }

  return conditions;
}

// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = getDateBetween;


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78