'use strict';
// Load system modules

// Load modules
let co = require( 'co' );
let _ = require( 'lodash' );
let Boom = require( 'boom' );
let db = require( 'db-utils' );
let debug = require( 'debug' )( 'UrbanScope:server:api:city:tweets:district' );

// Load my modules
let getTime = require( '../../../utils/time' );

// Constant declaration
const COLLECTION = 'posts';
const DATE_FORMAT = require( '../../../config/' ).dateFormat;
const NILS = require( '../../../config/milan_nils.json' );
const CACHE_MAX_AGE = 60*60*24*1; // 1 dd

// Module variables declaration

// Module functions declaration
function getAction( nil, filter, nilQueryTimes ) {
  let query = _.assign( {}, filter, {
    nil: nil,
  } );

  let action = db.find( COLLECTION, query, {
    _id: 0,
    lang: 1,
  } );

  debug( 'Requesting actions for nil %d', nil );
  let startTime = getTime();
  return action
  .hint( 'LanguageNil' )
  .toArray()
  .tap( ()=> {
    let ms = getTime( startTime );
    nilQueryTimes[ nil ] = ms;
    debug( 'Nil %d action COMPLETED in %d ms', nil, ms )
  } );
}

function* district( ctx ) {
  // Cache MAX_AGE
  ctx.maxAge = CACHE_MAX_AGE;

  debug( 'Requested district' );

  let start = ctx.startDate;
  let end = ctx.endDate;
  let language = ctx.language;
  let nils = ctx.nils;


  if( start.isAfter( end ) ) {
    throw Boom.badRequest( 'Start date after end date' );
  }

  let response = {
    startDate: start.format( DATE_FORMAT ),
    endDate: end.format( DATE_FORMAT ),
    language: language,
  };


  // Create query filter
  let filter = {
    source: 'twitter',
    timestamp: {
      $gte: start.toDate().getTime(),
      $lte: end.toDate().getTime(),
    },
  };


  // Add selected nils property to the response
  let selectedNils = [];
  if( nils.length ) {
    selectedNils = nils;
  } else {
    let allNils = _.map( NILS, 'properties.ID_NIL' );
    selectedNils = allNils;
  }

  // Filter by language
  filter.lang = language;
  if( language==='other' ) {
    filter.lang = {
      $nin: [ 'it', 'en', 'und', null ],
    };
  }

  // Start the query "actions"
  let actions = {};
  let nilQueryTimes = {};
  for( let nil of selectedNils ) {
    actions[ nil ] = getAction( nil, filter, nilQueryTimes );
  }
  ctx.metadata.nilQueryTimes = nilQueryTimes;

  // Get all posts
  debug( 'Requesting actions' );
  let startTime = getTime();
  let nilData = yield actions;
  let ms = getTime( startTime );
  ctx.metadata.query = ms;
  debug( 'Requesting actions COMPLETED in %d ms', ms );


  // Make some data manipulation
  debug( 'Data elaboration' );
  startTime = getTime();
  nilData = _( nilData )
  .map( ( data, nil ) => {
    let languages = _.countBy( data, 'lang' );
    let value = _.sum( languages );

    return {
      value: value,
      langs: languages,
      nil: Number( nil ),
    };
  } )
  .value();
  response.selectedNils = selectedNils;
  response.nils = nilData;


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