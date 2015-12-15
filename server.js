'use strict';
// Load system modules
let path = require( 'path' );

// Load modules
let Koa = require( 'koa' );
let Router = require( 'koa-router' );
let Promise = require( 'bluebird' );
let mkdirp = require( 'mkdirp' );
let debug = require( 'debug' )( 'Server' );

// Load my modules
let db = require( './db' );
let setMetadata = require( './api/middlewares/metadata' );
let handleErrors = require( './api/middlewares/error' );
let cityRouter = require( './api/city/' );
// let milanRouter = require( './api/milan/' );

// Constant declaration
const CONFIG = require( './config/index.json' );
const CACHE_PATH = path.resolve( __dirname, 'cache' );

// Module variables declaration

// Module functions declaration

// Module class declaration

// Module initialization (at first load)
// Promise.longStackTraces();
mkdirp = Promise.promisifyAll( mkdirp, { multiArgs: true } );

let app = new Koa();
app.name = 'UrbanScope';
app.proxy = true;

app.on( 'error', err => {
  debug( 'Server error', err, err.stack );
} );
// Middlewares
let mainRouter = new Router();
mainRouter.use( '/city', cityRouter.routes() );

// Enable main router
app.use( handleErrors );
app.use( setMetadata );
app.use( mainRouter.routes() );


// Entry point
mkdirp.mkdirpAsync( CACHE_PATH )
.then( db.open )
.then( ()=> {
  debug( 'App started' );

  app.listen( CONFIG.port );
  debug( 'Server ready on port %d', CONFIG.port );
} )


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78