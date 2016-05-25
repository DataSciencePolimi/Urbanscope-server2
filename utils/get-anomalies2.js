'use strict';
// Load system modules

// Load modules
const _ = require( 'lodash' );
const db = require( 'db-utils' );
const debug = require( 'debug' )( 'UrbanScope:utils:anomalies' );

// Load my modules
const getQuantiles = require( './get-quantiles' );

// Constant declaration
const THRESHOLD = 100;
const TIMELINE = 'timeline';

// Module variables declaration

// Module functions declaration
function formatTimelineData( timeline, type ) {
  debug( 'Formatting timeline data for %s', type );

  return _( timeline )
  .groupBy( 'id' )
  .mapValues( values => {

    return _( values )
    .groupBy( 'lang' )
    .mapValues( v => _.sumBy( v, 'value') )
    .value();
  } )
  .map( ( langCounts, id ) => {
    const total = _( langCounts ).map().sum();

    return {
      [type+'_id']: Number( id ),
      langCounts: langCounts,
      count: total,
    }
  } )
  .filter( o=> o.count>THRESHOLD )
  .value();
}
function getTimelineData( filter, type ) {
  debug( 'Get timeline data %s', type );

  // Add type
  filter.type = type;

  return db
  .find( TIMELINE, filter )
  .project( {
    _id: 0,
    type: 0,
    month: 0,
    year: 0,
  } )
  .sort( {
    id: 1,
  } )
  .toArray()
  .then( d => formatTimelineData( d, type ) );
}
function getLanguageValue( language, langCounts ) {
  if( language!=='other' ) {
    return langCounts[ language ];
  } else {
    // Collect all the "other" values
    return _( langCounts )
    .omit( [ 'it', 'en', 'und', null ] )
    .map()
    .sum();
  }
}
function formatAnomalies( anomalies, idType ) {
  debug( 'Format anomalies %s', idType );

  // Get all values for the quantiles
  const values = _.map( anomalies, 'value' );
  const q = getQuantiles( 3, 4, values );

  const t3 = q[2];
  const t4 = q[2] + 1.5*(q[2]-q[0]);

  return _.map( anomalies, anomaly => {
    const value = anomaly.value;
    let type = 'ERROR';

    if( value<=t3 ) {
      type = 'Percentuale non anomala';
    } else if( value>t3 && value<=t4 ) {
      type = 'Percentuale alta';
    } else if( value>t4 ) {
      type = 'Percentuale molto alta';
    }

    return {
      [idType+'_id']: anomaly[ idType + '_id' ],
      value: value,
      type: type,
    };
  } );
}
function* getAnomalies( filter, type, language ) {
  debug( 'Get anomalies for %s with language %s', type, language );

  const rawAnomalies = yield getTimelineData( filter, type );

  const anomaliesWithValue = _.map( rawAnomalies, d => {
    d.value = getLanguageValue( language, d.langCounts )/d.count;

    delete d.langCounts;
    return d;
  } );

  const anomalies = formatAnomalies( anomaliesWithValue, type );

  return anomalies;
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = getAnomalies;


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78