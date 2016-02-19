'use strict';
// Load system modules

// Load modules

// Load my modules

// Constant declaration


// Module variables declaration

// Module functions declaration
function getNsTime( time ) {
  if( time ) {
    let diff = process.hrtime( time );
    let ns = diff[ 0 ]*1e9+diff[ 1 ];
    return ns/1000000;
  } else {
    return process.hrtime();
  }
}


// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = getNsTime;

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78