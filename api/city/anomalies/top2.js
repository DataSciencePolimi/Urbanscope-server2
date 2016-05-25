'use strict';
// Load system modules

// Load modules
const co = require( 'co' );
const _ = require( 'lodash' );
const Boom = require( 'boom' );
const moment = require( 'moment' );
const debug = require( 'debug' )( 'UrbanScope:server:api:city:anomalies:top2' );

// Load my modules
const getAnomalies = require( '../../../utils/get-anomalies2' );
const getDateBetween = require( '../../../utils/get-between' );

// Constant declaration
const DATE_FORMAT = require( '../../../config/' ).dateFormat;
const NILS = require( '../../../config/milan_nils.json' );
const CACHE_MAX_AGE = 60*60*24; // 1 dd

// Module variables declaration

// Module functions declaration
function* topDistrict( ctx ) {
  // Cache MAX_AGE
  ctx.maxAge = Infinity; // We can store past values forever

  debug( 'Requested district' );

  const start = ctx.startDate;
  const end = ctx.endDate;
  const limit = ctx.limit;
  const language = ctx.language;


  if( start.isAfter( end ) ) {
    throw Boom.badRequest( 'Start date after end date' );
  }

  const response = {
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
  const filter = {
    lang: { $nin: [ 'und', null ] },
  };
  filter.$or = getDateBetween( start, end );

  const allNils = _.map( NILS, 'properties.ID_NIL' );


  const anomalies = yield getAnomalies( filter, 'nil', language );

  // Get above threshold
  const above = _.map( anomalies, 'nil_id' );
  response.nonTransparent = above;

  // Get below threshold
  const below = _.difference( allNils, above );
  response.belowThreshold = below;

  // Count by type
  response.counts = _.countBy( anomalies, 'type' );

  // Get nil anomalies
  response.top = _( anomalies )
  .orderBy( 'value', 'desc' )
  .take( limit )
  .value();

  // Set response
  ctx.body = response;
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = co.wrap( topDistrict );


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78