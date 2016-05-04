'use strict';
// Load system modules

// Load modules
const Router = require( 'koa-router' );

// Load my modules
const calls = require( './calls' );
const tweets = require( './tweets' );
const anomalies = require( './anomalies' );

// Constant declaration

// Module variables declaration

// Module functions declaration

// Module class declaration

// Module initialization (at first load)
const router = new Router();
router.use( '/tweets', tweets.routes() );
router.use( '/calls', calls.routes() );
router.use( '/anomaly', anomalies.routes() );

// Module exports
module.exports = router;


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78