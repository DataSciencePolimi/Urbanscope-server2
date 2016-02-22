'use strict';
// Load system modules

// Load modules
let _ = require( 'lodash' );
let db = require( 'db-utils' );
let Promise = require( 'bluebird' );
let debug = require( 'debug' )( 'UrbanScope:utils:anomalies' );

// Load my modules
let getTime = require( './time' );

// Constant declaration
const COLLECTION = 'posts';
const NILS = require( '../config/milan_nils.json' );
const MUNICIPALITIES = require( '../config/milan_municipalities.json' );
const indexMap = {
  nil: 'NIL',
  municipality: 'Municipality',
};
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

function convertToObject( property, data, id ) {
  let languages = _.map( data, 'lang' );

  return {
    [property]: Number( id ),
    langs: languages,
    count: languages.length,
  }
}
function getData( type, id, filter, times ) {
  let indexHint = indexMap[ type ];

  let query = _.assign( {}, filter, {
    [type]: id,
  } );

  debug( 'Requesting data for %s[%s]', type, id );
  let startTime = getTime();
  return db.find( COLLECTION, query, {
    _id: 0,
    lang: 1,
  } )
  .hint( indexHint )
  .toArray()
  .tap( () => {
    let ms = getTime( startTime );
    times[ id ] = ms;
    debug( 'Requesting data for %s[%s] COMPLETED in %d ms', type, id, ms );
  } );
}
function getAnomalies( filter, language, type, profile ) {
  debug( 'Get anomalies for %s', type );

  let all = [];
  if( type==='nil' ) {
    all = _.map( NILS, 'properties.ID_NIL' );
  } else if( type==='municipality' ) {
    all = _.map( MUNICIPALITIES, 'properties.PRO_COM' );
  } else {
    throw new Error( `Type "${type}" not recognized as valid` );
  }

  let actions = {};
  let times = {};
  for( let id of all ) {
    actions[ id ] = getData( type, id, filter, times );
  }
  profile[ type ] = times;


  debug( 'Requesting actions' );
  let queryTime = getTime();
  let elaborationTime;
  // Get all posts
  return Promise
  .props( actions )
  .tap( () => {
    let ms = getTime( queryTime );
    profile.query = ms;
    debug( 'Requesting actions COMPLETED in %d ms', ms );

    debug( 'Data elaboration' );
    elaborationTime = getTime();
  } )
  .then( data => _( data )
    .map( _.partial( convertToObject, type ) )
    .filter( o => o.count>THRESHOLD )
    .value()
  )
  .map( o => {
    let total = o.count;

    let languages = _( o.langs )
    .map( getLanguage )
    .countBy()
    .mapValues( val => val/total )
    .value()

    return {
      [ type+'_id' ]: o[ type ],
      value: languages[ language ] || 0,
    }
  } )
  .then( assignClass )
  .tap( () => {
    let ms = getTime( elaborationTime );
    profile.elaboration = ms;
    debug( 'Data elaboration COMPLETED in %d ms', ms );
  } )
  ;
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = getAnomalies;


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78