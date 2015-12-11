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

// Module variables declaration

// Module functions declaration
function convertToNil( nilData, nil ) {
  let languages = _.countBy( nilData, 'lang' );
  let value = _.sum( languages );
  return {
    nil: Number( nil ),
    value: value,
    langs: languages,
  };
}
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
    provider: 'twitter',
    date: {
      $gte: start.toDate(),
      $lte: end.toDate(),
    },
  };

  // Add selected nils property to the response
  if( nils.length ) {
    response.selectedNils = nils;
    filter.nil = { $in: nils };
  }

  // Filter by language
  filter.lang = language;
  if( language==='other' ) {
    filter.lang = {
      $nin: [ 'it', 'en', 'und' ],
    };
  }

  // Get all posts
  let nilData = yield db.find( COLLECTION, filter, {
    _id: 0,
    lang: 1,
    nil: 1,
  } )
  .toArray();

  nilData = _( nilData )
  .groupBy( 'nil' )
  .map( convertToNil )
  .value();

  response.nils = nilData;

  ctx.body = response;
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = co.wrap( district );


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78