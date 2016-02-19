'use strict';
// Load system modules

// Load modules
let co = require( 'co' );
let _ = require( 'lodash' );
let Boom = require( 'boom' );
let debug = require( 'debug' )( 'UrbanScope:server:api:municipality:anomalies:district' );

// Load my modules
let getAnomalies = require( '../../../utils/get-anomalies' );

// Constant declaration
const DATE_FORMAT = require( '../../../config/' ).dateFormat;
const MUNICIPALITIES = require( '../../../config/milan_municipalities.json' );
const CACHE_MAX_AGE = 60*60*24*90; // 90 dd

// Module variables declaration

// Module functions declaration
function* district( ctx ) {
  // Cache MAX_AGE
  ctx.maxAge = CACHE_MAX_AGE;

  debug( 'Requested district' );

  let start = ctx.startDate;
  let end = ctx.endDate;
  let language = ctx.language;


  if( start.isAfter( end ) ) {
    throw Boom.badRequest( 'Start date after end date' );
  }

  let response = {
    startDate: start.format( DATE_FORMAT ),
    endDate: end.format( DATE_FORMAT ),
    lang: language,
  };


  // Create query filter
  let filter = {
    source: 'twitter',
    date: {
      $gte: start.toDate(),
      $lte: end.toDate(),
    },
    lang: { $nin: [ 'und', null ] },
    // nil: { $nin: [ NaN, null ] },
  };

  let allMunicipalities = _.map( MUNICIPALITIES, 'properties.PRO_COM' );

  // Get anomalies
  let anomalies = yield getAnomalies( filter, language, 'municipality' );

  // Get above threshold
  let above = _( anomalies )
  .map( 'municipality_id' )
  .value();
  response.nonTransparent = above;

  // Get below threshold
  let below = _( allMunicipalities )
  .difference( above )
  .value();
  response.belowThreshold = below;

  // Count by type
  response.counts = _.countBy( anomalies, 'type' );

  // Get province anomalies
  let provinceData = _( anomalies )
  .value();
  response.provinces = provinceData;

  ctx.body = response;
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = co.wrap( district );


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78