'use strict';
// Load system modules

// Load modules
let co = require( 'co' );
let _ = require( 'lodash' );
let Boom = require( 'boom' );
let moment = require( 'moment' );
let debug = require( 'debug' )( 'UrbanScope:server:api:municipality:anomalies:top' );

// Load my modules
let getAnomalies = require( '../../../utils/get-anomalies' );
let getTime = require( '../../../utils/time' );

// Constant declaration
const DATE_FORMAT = require( '../../../config/' ).dateFormat;
const MUNICIPALITIES = require( '../../../config/milan_municipalities.json' );
const CACHE_MAX_AGE = 60*60*24; // 1 dd

// Module variables declaration

// Module functions declaration
function* district( ctx ) {
  // Cache MAX_AGE
  ctx.maxAge = Infinity; // We can store past values forever

  debug( 'Requested district' );

  let start = ctx.startDate;
  let end = ctx.endDate;
  let limit = ctx.limit;
  let language = ctx.language;


  if( start.isAfter( end ) ) {
    throw Boom.badRequest( 'Start date after end date' );
  }

  let response = {
    startDate: start.format( DATE_FORMAT ),
    endDate: end.format( DATE_FORMAT ),
    lang: language,
    limit: limit,
  };


  if( moment().isBetween( start, end ) ) {
    // We cannot store the values forever, since we are in the timespan
    ctx.maxAge = CACHE_MAX_AGE;
  }


  // Create query filter
  let filter = {
    source: 'twitter',
    timestamp: {
      $gte: start.toDate().getTime(),
      $lte: end.toDate().getTime(),
    },
    lang: { $nin: [ 'und', null ] },
    // nil: { $nin: [ NaN, null ] },
  };

  // Get anomalies
  debug( 'Requesting anomalies' );
  let anomalyTimes = {};
  let startTime = getTime();
  let anomalies = yield getAnomalies( filter, language, 'municipality', anomalyTimes );
  let ms = getTime( startTime );
  ctx.metadata.anomalies = anomalyTimes;
  ctx.metadata.query = ms;
  debug( 'Requesting anomalies COMPLETED in %d ms', ms );


  debug( 'Data elaboration' );
  startTime = getTime();

  // Get above threshold
  let above = _( anomalies )
  .map( 'municipality_id' )
  .value();
  response.nonTransparent = above;

  // Get below threshold
  let below = _( MUNICIPALITIES )
  .map( 'properties.PRO_COM' )
  .difference( above )
  .value();
  response.belowThreshold = below;

  // Count by type
  response.counts = _.countBy( anomalies, 'type' );

  // Get nil anomalies
  let top = _( anomalies )
  .orderBy( 'value', 'desc' )
  .take( limit )
  .value();
  response.top = top;



  ms = getTime( startTime );
  ctx.metadata.elaboration = ms;
  debug( 'Data elaboration COMPLETED in %d ms', ms );

  // Set response
  ctx.body = response;
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = co.wrap( district );


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78