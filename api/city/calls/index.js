'use strict';
// Load system modules

// Load modules
let Router = require( 'koa-router' );
let compose = require( 'koa-compose' );

// Load my modules
let startDate = require( '../../middlewares/start-date' );
let endDate = require( '../../middlewares/end-date' );
let callType = require( '../../middlewares/call-type' );
let parseNil = require( '../../middlewares/nil' );
let limit = require( '../../middlewares/limit' );
let order = require( '../../middlewares/order' );
let district = require( './district' );
let timeline = require( './timeline' );
let list = require( './list' );
let total = require( './total' );
let top = require( './top' );

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
  callType,
  parseNil( true )
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