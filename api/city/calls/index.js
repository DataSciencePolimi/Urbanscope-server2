'use strict';
// Load system modules

// Load modules
const Router = require( 'koa-router' );
const compose = require( 'koa-compose' );

// Load my modules
const startDate = require( '../../middlewares/start-date' );
const endDate = require( '../../middlewares/end-date' );
const callType = require( '../../middlewares/call-type' );
const parseNil = require( '../../middlewares/nil' );
const limit = require( '../../middlewares/limit' );
const order = require( '../../middlewares/order' );
const district = require( './district' );
const timeline = require( './timeline' );
const list = require( './list' );
const total = require( './total' );
const top = require( './top' );

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
  callType,
  parseNil( true ),
] ), district );
router.get( '/timeline', dates, timeline );
router.get( '/list', compose( [
  dates,
  limit,
  parseNil( false ),
] ), list );
router.get( '/total', dates, total );
router.get( '/top', compose( [
  dates,
  limit,
  order,
] ), top );

// Module exports
module.exports = router;






//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78