'use strict';
// Load system modules

// Load modules
const Router = require( 'koa-router' );
const compose = require( 'koa-compose' );

// Load my modules
const startDate = require( '../../middlewares/start-date' );
const endDate = require( '../../middlewares/end-date' );
const language = require( '../../middlewares/language' );
const limit = require( '../../middlewares/limit' );
const district = require( './district' );
const district2 = require( './district2' );
const top = require( './top' );
const top2 = require( './top2' );

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
] ), district );
router.get( '/top', compose( [
  dates,
  limit,
  language,
] ), top );

router.get( '/district2', compose( [
  dates,
  language,
] ), district2 );
router.get( '/top2', compose( [
  dates,
  limit,
  language,
] ), top2 );

// Module exports
module.exports = router;

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78