'use strict';
// Load system modules

// Load modules
let co = require( 'co' );
let Boom = require( 'boom' );
let debug = require( 'debug' )( 'Api:city:tweets:text' );

// Load my modules
let db = require( '../../../db' );

// Constant declaration
const COLLECTION = 'posts';
const DATE_FORMAT = require( '../../../config/' ).dateFormat;

// Module variables declaration

// Module functions declaration
function* getTweetsText( ctx ) {
  debug( 'Requested text' );

  let start = ctx.startDate;
  let end = ctx.endDate;
  let limit = ctx.limit;
  let nil = ctx.nil;


  if( start.isAfter( end ) ) {
    throw Boom.badRequest( 'Start date after end date' );
  }

  let response = {
    startDate: start.format( DATE_FORMAT ),
    endDate: end.format( DATE_FORMAT ),
    nil: nil,
    limit: limit,
  };


  // Create query filter
  let filter = {
    source: 'twitter',
    date: {
      $gte: start.toDate(),
      $lte: end.toDate(),
    },
    nil: nil,
    // Remove the sensitive contents
    'raw.possibly_sensitive': { $ne: true },
    // and the retweets
    'raw.retweeted_status': { $exists: false },
  };

  let tweets = yield db.find( COLLECTION, filter, {
    _id: 0,
    id: 1,
    lang: 1,
    date: 1,
    author: 1,
    authorId: 1,
    text: 1,
  } )
  .limit( limit )
  .sort( {
    date: -1,
  } )
  .toArray();

  response.tweets = tweets;

  ctx.body = response;
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = co.wrap( getTweetsText );


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78