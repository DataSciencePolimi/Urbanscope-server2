'use strict';
// Load system modules

// Load modules
let _ = require( 'lodash' );
let debug = require( 'debug' )( 'Utils:anomalies' );

// Load my modules
let db = require( '../db' );

// Constant declaration
const COLLECTION = 'posts';
const NILS = require( '../config/nils.json' );
const THRESHOLD = 100;

// Module variables declaration

// Module functions declaration
function calculateQuartile( i, base, values ) {
  let Fi = i/base;
  let n = values.length;
  let int = Math.floor;

  let prod = n*Fi;
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
  let sortedValues = values.sort();

  let quantiles = [];
  for( var i=1; i<=num; i++ ) {
    quantiles.push( calculateQuartile( i, base, sortedValues ) );
  }

  return quantiles;
}
function assignClass( data ) {
  let values = _.map( data, 'value' );
  let q = getQuantiles( 3, 4, values );

  let t3 = q[2];
  let t4 = q[2] + 1.5*(q[2]-q[0]);

  return _.map( data, element => {

    if( element.value<=t3 ) {
      element.type = 'Percentuale non anomala';
    } else if( element.value>t3 && element.value<=t4 ) {
      element.type = 'Percentuale alta';
    } else if( element.value>t4 ) {
      element.type = 'Percentuale molto alta';
    }

    return element;
  } );
}
function getLanguage( language ) {
  language = language || 'und';
  language = language.toLowerCase();

  if( language!=='it' && language!=='en' ) {
    return 'other';
  } else {
    return language;
  }
}
function getNilObject( language, data ) {
  let nil = Number( data._id );
  let total = data.count;
  let languages = data.langs;

  languages = _( languages )
  .map( getLanguage )
  .countBy()
  .mapValues( val => val/total )
  .value();

  return {
    value: languages[ language ] || 0,
    nil_id: nil, //eslint-disable-line camelcase
  };
}
function getAnomalies( filter, language ) {
  debug( 'Get anomalies' );

  let pipeline = [];
  // Filter
  pipeline.push( {
    $match: filter,
  } );
  // Select fields
  pipeline.push( {
    $project: {
      _id: 0,
      lang: 1,
      nil: 1,
    },
  } );
  // Group by nil
  pipeline.push( {
    $group: {
      _id: '$nil',
      langs: { $push: '$lang' },
      count: { $sum: 1 },
    }
  } );
  // Filter non siutable NILS
  pipeline.push( {
    $match: {
      count: { $gt: THRESHOLD },
    }
  } );
  // Sort
  pipeline.push( {
    $sort: {
      _id: 1,
    }
  } );

  let parseData = _.partial( getNilObject, language );

  // Get all data
  return db
  .aggregate( COLLECTION, pipeline )
  .toArray()
  .then( data =>
    _( data )
    .map( parseData )
    .value()
  )
  .then( assignClass );
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = getAnomalies;


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78