'use strict';
// Load system modules

// Load modules
let Router = require( 'koa-router' );
let compose = require( 'koa-compose' );

// Load my modules
let startDate = require( '../../middlewares/start-date' );
let endDate = require( '../../middlewares/end-date' );
let parseMunicipality = require( '../../middlewares/municipality' );
let language = require( '../../middlewares/language' );
let limit = require( '../../middlewares/limit' );
let district = require( './district' );
let timeline = require( './timeline' );
let text = require( './text' );

// Constant declaration

// Module variables declaration
let dates = compose( [
  startDate,
  endDate,
] );

// Module functions declaration

// Module class declaration

// Module initialization (at first load)
let router = new Router();
router.get( '/district', compose( [
  dates,
  language,
  parseMunicipality( true ),
] ), district );
router.get( '/timeline', compose( [
  dates,
  language,
] ), timeline );
router.get( '/text', compose( [
  dates,
  limit,
  parseMunicipality( false ),
] ), text );

// Module exports
module.exports = router;

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78