'use strict';
// Load system modules

// Load modules
let co = require( 'co' );
let _ = require( 'lodash' );
let Boom = require( 'boom' );
let debug = require( 'debug' )( 'UrbanScope:server:api:municipality:tweets:district' );

// Load my modules
let db = require( 'db-utils' );

// Constant declaration
const COLLECTION = 'posts';
const DATE_FORMAT = require( '../../../config/' ).dateFormat;
const MUNICIPALITIES = require( '../../../config/milan_municipalities.json' );
const CACHE_MAX_AGE = 60*60*24*1; // 1 dd

// Module variables declaration

// Module functions declaration
function* district( ctx ) {
  // Cache MAX_AGE
  ctx.maxAge = CACHE_MAX_AGE;

  debug( 'Requested district' );

  let start = ctx.startDate;
  let end = ctx.endDate;
  let language = ctx.language;
  let municipalities = ctx.municipalities;


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
    date: {
      $gte: start.toDate(),
      $lte: end.toDate(),
    },
  };


  // Add selected Municipalities property to the response
  let selectedMunicipalities = [];
  if( municipalities.length ) {
    selectedMunicipalities = municipalities;
  } else {
    let allMunicipalities = _.map( MUNICIPALITIES, 'properties.PRO_COM' );
    selectedMunicipalities = allMunicipalities;
  }

  // Filter by language
  filter.lang = language;
  if( language==='other' ) {
    filter.lang = {
      $nin: [ 'it', 'en', 'und', null ],
    };
  }


  // Prepare all the actions(queries) to execute so we can optimize the performance
  let actions = {};
  for( let municipality of selectedMunicipalities ) {
    let query = _.assign( {}, filter, {
      municipality: municipality,
    } );

    let action = db.find( COLLECTION, query, {
      _id: 0,
      lang: 1,
    } );

    actions[ municipality ] = action
    .hint( { municipality: 1 } )
    .toArray();
  }

  // Get all posts
  let municipalityData = yield actions;

  municipalityData = _( municipalityData )
  .map( ( data, municipality ) => {
    let languages = _.countBy( data, 'lang' );
    let value = _.sum( languages );

    return {
      value: value,
      langs: languages,
      municipality: Number( municipality ),
    };
  } )
  .value();


  response.selectedMunicipalities = selectedMunicipalities;
  response.municipalities = municipalityData;

  ctx.body = response;
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = co.wrap( district );


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78