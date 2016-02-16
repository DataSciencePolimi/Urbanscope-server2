'use strict';
// Load system modules

// Load modules
let Router = require( 'koa-router' );

// Load my modules
let tweets = require( './tweets' );
let anomalies = require( './anomalies' );

// Constant declaration

// Module variables declaration

// Module functions declaration

// Module class declaration

// Module initialization (at first load)
let router = new Router();
router.use( '/tweets', tweets.routes() );
router.use( '/anomaly', anomalies.routes() );

// Module exports
module.exports = router;


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78