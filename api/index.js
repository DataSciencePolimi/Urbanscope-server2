'use strict';
// Load system modules

// Load modules
let Koa = require( 'koa' );
let Router = require( 'koa-router' );
let debug = require( 'debug' )( 'UrbanScope:server:api' );

// Load my modules
let setMetadata = require( './middlewares/metadata' );
let handleErrors = require( './middlewares/error' );
let cache = require( './middlewares/cache' );
let cityRouter = require( './city/' );
let municipalityRouter = require( './municipality/' );

// Constant declaration

// Module variables declaration

// Module functions declaration

// Module class declaration

// Module initialization (at first load)
let app = new Koa();
app.name = 'UrbanScope';
app.proxy = true;

app.on( 'error', err => {
  debug( 'Server error', err, err.stack );
} );
// Middlewares
let mainRouter = new Router();
mainRouter.use( '/city', cityRouter.routes() );
mainRouter.use( '/municipality', municipalityRouter.routes() );

// Enable main router
app.use( handleErrors );
app.use( setMetadata );
if( process.env.NODE_ENV!=='test' ) {
  app.use( cache() );
}
app.use( mainRouter.routes() );


// Module exports
module.exports = app;


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78