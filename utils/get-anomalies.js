'use strict';
// Load system modules

// Load modules
const _ = require( 'lodash' );
const db = require( 'db-utils' );
const Promise = require( 'bluebird' );
const debug = require( 'debug' )( 'UrbanScope:utils:anomalies' );

// Load my modules
const getQuantiles = require( './get-quantiles' );
const getTime = require( './time' );

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
function assignClass( data ) {
  const values = _.map( data, 'value' );
  const q = getQuantiles( 3, 4, values );

  const t3 = q[2];
  const t4 = q[2] + 1.5*(q[2]-q[0]);

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
  const languages = _.map( data, 'lang' );

  return {
    [property]: Number( id ),
    langs: languages,
    count: languages.length,
  }
}
function getData( type, id, filter, times ) {
  const indexHint = indexMap[ type ];

  const query = _.assign( {}, filter, {
    [type]: id,
  } );


  debug( 'Requesting data for %s[%s]', type, id );
  const startTime = getTime();
  return db.find( COLLECTION, query, {
    _id: 0,
    lang: 1,
  } )
  .hint( indexHint )
  .toArray()
  .tap( () => {
    const ms = getTime( startTime );
    times[ id ] = ms;
    debug( 'Requesting data for %s[%s] COMPconstED in %d ms', type, id, ms );
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

  const actions = {};
  const times = {};
  for( const id of all ) {
    actions[ id ] = getData( type, id, filter, times );
  }
  profile[ type ] = times;


  debug( 'Requesting actions' );
  const queryTime = getTime();
  let elaborationTime;
  // Get all posts
  return Promise
  .props( actions )
  .tap( () => {
    const ms = getTime( queryTime );
    profile.query = ms;
    debug( 'Requesting actions COMPconstED in %d ms', ms );

    debug( 'Data elaboration' );
    elaborationTime = getTime();
  } )
  .then( data => _( data )
    .map( _.partial( convertToObject, type ) )
    .filter( o => o.count>THRESHOLD )
    .value()
  )
  .map( o => {
    const total = o.count;

    debug( 'Nil[%d]: %d', o.nil, total );

    const languages = _( o.langs )
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
    const ms = getTime( elaborationTime );
    profile.elaboration = ms;
    debug( 'Data elaboration COMPconstED in %d ms', ms );
  } )
  ;
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = getAnomalies;


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78