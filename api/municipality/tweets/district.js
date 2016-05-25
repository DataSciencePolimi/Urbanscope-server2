'use strict';
// Load system modules

// Load modules
const co = require( 'co' );
const _ = require( 'lodash' );
const Boom = require( 'boom' );
const db = require( 'db-utils' );
const debug = require( 'debug' )( 'UrbanScope:server:api:municipality:tweets:district' );

// Load my modules
const getTime = require( '../../../utils/time' );

// Constant declaration
const COLLECTION = 'posts';
const DATE_FORMAT = require( '../../../config/' ).dateFormat;
const MUNICIPALITIES = require( '../../../config/milan_municipalities.json' );
const CACHE_MAX_AGE = 60*60*24*1; // 1 dd

// Module variables declaration

// Module functions declaration
function getAction( municipality, filter, municipalityQueryTimes ) {
  const query = _.assign( {}, filter, {
    municipality: municipality,
  } );

  const action = db.find( COLLECTION, query, {
    _id: 0,
    lang: 1,
  } );

  debug( 'Requesting actions for municipality %d', municipality );
  const startTime = getTime();
  return action
  .hint( 'LanguageMunicipality' )
  .toArray()
  .tap( ()=> {
    const ms = getTime( startTime );
    municipalityQueryTimes[ municipality ] = ms;
    debug( 'municipality %d action COMPLETED in %d ms', municipality, ms )
  } );
}
function* district( ctx ) {
  // Cache MAX_AGE
  ctx.maxAge = CACHE_MAX_AGE;

  debug( 'Requested district' );

  const start = ctx.startDate;
  const end = ctx.endDate;
  const language = ctx.language;
  const municipalities = ctx.municipalities;


  if( start.isAfter( end ) ) {
    throw Boom.badRequest( 'Start date after end date' );
  }

  const response = {
    startDate: start.format( DATE_FORMAT ),
    endDate: end.format( DATE_FORMAT ),
    language: language,
  };


  // Create query filter
  const filter = {
    source: 'twitter',
    timestamp: {
      $gte: start.toDate().getTime(),
      $lte: end.toDate().getTime(),
    },
  };


  // Add selected Municipalities property to the response
  let selectedMunicipalities = [];
  if( municipalities.length ) {
    selectedMunicipalities = municipalities;
  } else {
    const allMunicipalities = _.map( MUNICIPALITIES, 'properties.PRO_COM' );
    selectedMunicipalities = allMunicipalities;
  }

  // Filter by language
  filter.lang = language;
  if( language==='other' ) {
    filter.lang = {
      $nin: [ 'it', 'en', 'und', null ],
    };
  }


  // Start the query "actions"
  const actions = {};
  const municipalityQueryTimes = {};
  for( const municipality of selectedMunicipalities ) {
    actions[ municipality ] = getAction( municipality, filter, municipalityQueryTimes );
  }
  ctx.metadata.nilQueryTimes = municipalityQueryTimes;

  // Get all posts
  debug( 'Requesting actions' );
  let startTime = getTime();
  let municipalityData = yield actions;
  let ms = getTime( startTime );
  ctx.metadata.query = ms;
  debug( 'Requesting actions COMPLETED in %d ms', ms );

  // Make some data manipulation
  debug( 'Data elaboration' );
  startTime = getTime();
  municipalityData = _( municipalityData )
  .map( ( data, municipality ) => {
    const languages = _.countBy( data, 'lang' );
    const value = _( languages ).map().sum();

    return {
      value: value,
      langs: languages,
      municipality: Number( municipality ),
    };
  } )
  .value();
  response.selectedMunicipalities = selectedMunicipalities;
  response.municipalities = municipalityData;


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