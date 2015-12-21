'use strict';
// Load system modules

// Load modules
let co = require( 'co' );
let _ = require( 'lodash' );
let Boom = require( 'boom' );
let debug = require( 'debug' )( 'Api:city:tweets:district' );

// Load my modules
let db = require( '../../../db' );

// Constant declaration
const COLLECTION = 'posts';
const DATE_FORMAT = require( '../../../config/' ).dateFormat;
const NILS = require( '../../../config/nils.json' );

// Module variables declaration

// Module functions declaration
function* district( ctx ) {
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
    $or: [
      { provider: 'twitter' },
      { source: 'twitter' },
    ],
    date: {
      $gte: start.toDate(),
      $lte: end.toDate(),
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
      $nin: [ 'it', 'en', 'und' ],
    };
  }

  let actions = {};
  for( let nil of selectedNils ) {
    let query = _.assign( {}, filter, {
      nil: nil,
    } );

    let action = db.find( COLLECTION, query, {
      _id: 0,
      lang: 1,
    } );

    actions[ nil ] = action.toArray();
  }

  // Get all posts
  let nilData = yield actions;

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

  ctx.body = response;
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = co.wrap( district );


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78