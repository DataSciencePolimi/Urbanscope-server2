'use strict';
// Load system modules

// Load modules
let co = require( 'co' );
let _ = require( 'lodash' );
let Boom = require( 'boom' );
let db = require( 'db-utils' );
let debug = require( 'debug' )( 'UrbanScope:server:api:municipality:tweets:text' );

// Load my modules
let getTime = require( '../../../utils/time' );

// Constant declaration
const COLLECTION = 'posts';
const DATE_FORMAT = require( '../../../config/' ).dateFormat;

// Module variables declaration

// Module functions declaration
function* getTweetsText( ctx ) {
  debug( 'Requested text' );

  // Special parse language
  let qs = ctx.request.query;
  let lang = qs.lang || 'it';
  lang = lang.toLowerCase();

  let start = ctx.startDate;
  let end = ctx.endDate;
  let limit = ctx.limit;
  let municipality = ctx.municipality;


  if( start.isAfter( end ) ) {
    throw Boom.badRequest( 'Start date after end date' );
  }

  let response = {
    startDate: start.format( DATE_FORMAT ),
    endDate: end.format( DATE_FORMAT ),
    municipality: municipality,
    lang: lang,
    limit: limit,
  };


  // Create query filter
  let filter = {
    source: 'twitter',
    timestamp: {
      $gte: start.toDate().getTime(),
      $lte: end.toDate().getTime(),
    },
    lang: lang,
    municipality: municipality,
  };

  if( lang==='other' ) {
    filter.lang = {
      $nin: [ 'it', 'en', 'und', null ],
    };
  }

  debug( 'Filter: %j', filter );

  debug( 'Requesting tweets' );
  let startTime = getTime();
  let tweets = yield db.find( COLLECTION, filter, {
    _id: 0,
    id: 1,
    lang: 1,
    date: 1,
    author: 1,
    authorId: 1,
    text: 1,
    'raw.possibly_sensitive': 1,
    'raw.retweeted_status': 1,
  } )
  .sort( {
    date: -1,
  } )
  .hint( 'LanguageMunicipality' )
  .limit( limit+Math.round( limit/4 ) ) // Get more tweets so after the filtering we have enough
  .toArray();
  let ms = getTime( startTime );
  ctx.metadata.query = ms;
  debug( 'Requesting tweets COMPLETED in %d ms', ms );



  debug( 'Data elaboration' );
  startTime = getTime();

  debug( 'From %d tweets', tweets.length );
  // Filter RT and sensitive content
  tweets = _( tweets )
  .filter( t => !t.raw.possibly_sensitive ) // Filter out sensitive content
  .filter( t => !t.raw.retweeted_status ) // Filter out retweets
  .take( limit ) // Keep only "limit" tweets
  .value();

  debug( 'To %d tweets', tweets.length );

  response.tweets = tweets;


  ms = getTime( startTime );
  ctx.metadata.elaboration = ms;
  debug( 'Data elaboration COMPLETED in %d ms', ms );

  // Set response
  ctx.body = response;
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = co.wrap( getTweetsText );


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78