'use strict';
// Load system modules

// Load modules
let co = require( 'co' );
let _ = require( 'lodash' );
let Boom = require( 'boom' );
let moment = require( 'moment' );
let debug = require( 'debug' )( 'Api:city:tweets:timeline' );

// Load my modules
let db = require( '../../../db' );

// Constant declaration
const COLLECTION = 'posts';
const DATE_FORMAT = require( '../../../config/' ).dateFormat;

// Module variables declaration

// Module functions declaration
function* getTimeline( ctx ) {
  debug( 'Requested timeline' );

  let start = ctx.startDate;
  let end = ctx.endDate;
  let language = ctx.language;


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

  // Filter by language
  filter.lang = language;
  if( language==='other' ) {
    filter.lang = {
      $nin: [ 'it', 'en', 'und' ],
    };
  }

  let pipeline = [];

  pipeline.push( {
    $match: filter,
  } );
  pipeline.push( {
    $group: {
      _id: {
        year: { $year: '$date' },
        month: { $month: '$date' },
      },
      count: { $sum: 1 },
    },
  } );

  let timeline = yield db.aggregate( COLLECTION, pipeline ).toArray();

  timeline = _( timeline )
  .map( data => {
    let year = data._id.year;
    let month = data._id.month - 1;
    return {
      date: moment.utc( { year, month } ).format( 'YYYY-MM' ),
      value: data.count,
    }
  } )
  .value();

  response.timeline = timeline;

  ctx.body = response;
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = co.wrap( getTimeline );


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78