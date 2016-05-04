'use strict';
// Load system modules

// Load modules
const Router = require( 'koa-router' );
const compose = require( 'koa-compose' );

// Load my modules
const startDate = require( '../../middlewares/start-date' );
const endDate = require( '../../middlewares/end-date' );
const parseNil = require( '../../middlewares/nil' );
const language = require( '../../middlewares/language' );
const limit = require( '../../middlewares/limit' );
const district = require( './district' );
const timeline = require( './timeline' );
const text = require( './text' );
const test = require( './test' );

// Constant declaration

// Module variables declaration
const dates = compose( [
  startDate,
  endDate,
] );

// Module functions declaration

// Module class declaration

// Module initialization (at first load)
const router = new Router();
router.get( '/district', compose( [
  dates,
  language,
  parseNil( true ),
] ), district );
router.get( '/timeline', compose( [
  dates,
  language,
] ), timeline );
router.get( '/text', compose( [
  dates,
  limit,
  parseNil( false ),
] ), text );
router.get( '/test', compose( [
  dates,
  language,
] ), test );

// Module exports
module.exports = router;

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78