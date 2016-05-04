'use strict';
// Load system modules

// Load modules

// Load my modules

// Constant declaration

// Module variables declaration

// Module functions declaration
function calculateQuartile( i, base, values ) {
  const Fi = i/base;
  const n = values.length;
  const int = Math.floor;

  const prod = n*Fi;
  let val;

  // Check if the product is an integer
  if( int( prod )===prod ) {
    val = (values[ prod-1 ] + values[ prod ])/2;
  } else {
    val = values[ int( prod ) ];
  }

  return val;
}
function getQuantiles( num, base, values ) {
  const sortedValues = values.sort();

  const quantiles = [];
  for( let i=1; i <= num; i++ ) {
    quantiles.push( calculateQuartile( i, base, sortedValues ) );
  }

  return quantiles;
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = getQuantiles;


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78