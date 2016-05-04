'use strict';
// Load system modules

// Load modules
const Koa = require( 'koa' );
const Router = require( 'koa-router' );
// const helmet = require( 'koa-helmet' );
const debug = require( 'debug' )( 'UrbanScope:server:api' );

// Load my modules
const setMetadata = require( './middlewares/metadata' );
const handleErrors = require( './middlewares/error' );
const cache = require( './middlewares/cache' );
const cityRouter = require( './city/' );
const municipalityRouter = require( './municipality/' );

// Constant declaration

// Module variables declaration

// Module functions declaration
function addHelmet( router ) {
  // Secure endpoint
  // router.use( helmet.csp() );
  // router.use( helmet.dnsPrefetchControl() );
  // router.use( helmet.noCache() );
  // router.use( helmet.publicKeyPins() );
  // router.use( helmet.hsts() ); // Use HTTPS :(
  // router.use( helmet.frameguard() );
  // router.use( helmet.hidePoweredBy() );
  // router.use( helmet.ieNoOpen() );
  // router.use( helmet.noSniff() );
  // router.use( helmet.xssFilter() );
}
function addRouterMiddelwares( router ) {
  addHelmet( router );
  // Add metadata to the request
  router.use( setMetadata );

  // Enable cache or not
  if( process.env.NODE_ENV==='production' ) {
    router.use( '/city', cache(), cityRouter.routes() );
    router.use( '/municipality', cache(), municipalityRouter.routes() );
  } else {
    router.use( '/city', cityRouter.routes() );
    router.use( '/municipality', municipalityRouter.routes() );
  }

}
function addAppMiddelwares( app ) {
  // Enable main router
  app.use( handleErrors );
}
function initRouter() {
  const router = new Router();
  addRouterMiddelwares( router );

  return router;
}
function initApplication() {
  const app = new Koa();
  app.name = 'UrbanScope';
  app.proxy = true;

  app.on( 'error', err => {
    debug( 'Server error', err, err.stack );
  } );
  addAppMiddelwares( app );

  // Create router
  const router = initRouter();

  // Enable router
  app.use( router.routes() );

  return app;
}
// Module class declaration

// Module initialization (at first load)
const app = initApplication();




// Module exports
module.exports = app;


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78