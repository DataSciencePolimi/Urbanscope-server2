'use strict';
// Load system modules

// Load modules
const co = require( 'co' );
const _ = require( 'lodash' );
const Promise = require( 'bluebird' );
// const Boom = require( 'boom' );
const moment = require( 'moment' );
const debug = require( 'debug' )( 'UrbanScope:server:api:city:anomalies:test' );

// Load my modules
const getAnomaliesKey = require( '../../../utils/get-anomalies-key' );
const getQuantiles = require( '../../../utils/get-quantiles' );

// Constant declaration
const DATE_FORMAT = require( '../../../config/' ).dateFormat;
const NILS = require( '../../../config/milan_nils.json' );
const THRESHOLD = 100;

// Module variables declaration

// Module functions declaration
function* test( ctx ) {
  debug( 'Test endpoint for anomalies' );
  const redis = ctx.app.context.redis;
  const year = Number( ctx.request.query.year );
  const trimester = Number( ctx.request.query.trimester ) - 1;
  const language = ctx.language;


  const start = moment.utc( {
    year: year,
    month: trimester*3,
  } )
  .startOf( 'month' );
  const end = start.clone()
  .add( 2, 'month' )
  .endOf( 'month' );

  const response = {
    startDate: start.format( DATE_FORMAT ),
    endDate: end.format( DATE_FORMAT ),
    lang: language,
  };

  const allNils = _.map( NILS, 'properties.ID_NIL' );

  const nilData = {};
  for( const nil of allNils ) {
    const key = getAnomaliesKey( year, trimester, 'nil', nil );
    // debug( 'Key for nil(%d) is: %s', nil, key );

    nilData[ nil ] = redis.hgetall( key );
  }

  // Wait for alla queries to complete
  const data = yield Promise.props( nilData );


  const anomalies = _( data )
  .mapValues( ( langCounts, nil )=> {
    const total = _( langCounts ).map( Number ).sum();
    const value = Number( langCounts[ language ] );

    return {
      nil_id: Number( nil ), // eslint-disable-line camelcase
      count: total,
      value: value/total,
    };
  } )
  .map()
  .filter( o=> o.count>THRESHOLD )
  .value();

  // Get all values for the quantiles
  const values = _.map( anomalies, 'value' );
  const q = getQuantiles( 3, 4, values );

  const t3 = q[2];
  const t4 = q[2] + 1.5*(q[2]-q[0]);

  _.each( anomalies, anomaly => {
    // Remove total
    delete anomaly.count;

    if( anomaly.value<=t3 ) {
      anomaly.type = 'Percentuale non anomala';
    } else if( anomaly.value>t3 && anomaly.value<=t4 ) {
      anomaly.type = 'Percentuale alta';
    } else if( anomaly.value>t4 ) {
      anomaly.type = 'Percentuale molto alta';
    }
  } );

  // Get above threshold
  const above = _.map( anomalies, 'nil_id' );
  response.nonTransparent = above;

  // Get below threshold
  const below = _.difference( allNils, above );
  response.belowThreshold = below;

  // Count by type
  response.counts = _.countBy( anomalies, 'type' );

  // Get nil anomalies
  response.nils = anomalies;


  // Set response
  ctx.body = response;
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = co.wrap( test );


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78