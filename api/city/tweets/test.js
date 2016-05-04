'use strict';
// Load system modules

// Load modules
const co = require( 'co' );
const _ = require( 'lodash' );
const Boom = require( 'boom' );
const moment = require( 'moment' );
const debug = require( 'debug' )( 'UrbanScope:server:api:city:tweets:test' );

// Load my modules

// Constant declaration
const DATE_FORMAT = require( '../../../config/' ).dateFormat;
const CACHE_MAX_AGE = 60*60*24*1; // 1 dd
const TIMELINE_KEY = 'timeline';
const REDIS_DATE_FORMAT = 'YYYY-M';
const OUT_DATE_FORMAT = 'YYYY-MM';

// Module variables declaration

// Module functions declaration
function getKey( lang ) {
  return `${TIMELINE_KEY}-${lang}`;
}
function* getRedisTimeline( redis, language ) {
  const key = getKey( language );
  if( language!=='other' ) {
    return redis.hgetall( key );
  } else {
    const keys = yield redis.keys( 'UrbanScope:'+getKey( '*' ) );

    const languages = _( keys )
    .map( k => k.split( '-' )[1] )
    .difference( [ 'it', 'en' ] )
    .value();

    let languageData = _( languages )
    .map( getKey )
    .map( lKey => redis.hgetall( lKey ) )
    .value();

    languageData = yield languageData;

    const cumulativeData = {};

    _.each( languageData, languageTimeline => {
      _.each( languageTimeline, ( v, k )=> {
        const value = Number( v );
        cumulativeData[ k ] = cumulativeData[ k ] || 0;
        cumulativeData[ k ] += value;
      } );
    } );

    return cumulativeData;
  }
}
function* getTimeline( ctx ) {
  const redis = ctx.app.context.redis;
  // Cache MAX_AGE
  ctx.maxAge = CACHE_MAX_AGE;

  debug( 'Requested timeline' );

  const start = ctx.startDate;
  const end = ctx.endDate;
  const language = ctx.language;


  if( start.isAfter( end ) ) {
    throw Boom.badRequest( 'Start date after end date' );
  }

  const response = {
    startDate: start.format( DATE_FORMAT ),
    endDate: end.format( DATE_FORMAT ),
    lang: language,
  };

  const redisTimeline = yield getRedisTimeline( redis, language );
  // response.redisTimeline = redisTimeline;

  const timeline = _( redisTimeline )
  .map( ( v, k )=> {
    return {
      date: moment( k, REDIS_DATE_FORMAT ).format( OUT_DATE_FORMAT ),
      value: Number( v ),
    };
  } )
  .filter( d => moment( d.date, OUT_DATE_FORMAT ).isBetween( start, end ) )
  .orderBy( 'date', 'asc' )
  .value();

  response.timeline = timeline;

  // Set response
  ctx.body = response;
}
// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = co.wrap( getTimeline );


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78