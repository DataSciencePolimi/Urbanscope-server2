'use strict';
// Load system modules

// Load modules
let Promise = require( 'bluebird' );
let debug = require( 'debug' )( 'UrbanScope:server' );

// Load my modules
let db = require( 'db-utils' );
let api = require( './api/' );

// Constant declaration
const CONFIG = require( './config/index.json' );
const MONGO = require( './config/mongo.json' );
const COLLECTIONS = MONGO.collections;
const DB_URL = MONGO.url;
const DB_NAME = MONGO.name;

// Module variables declaration

// Module functions declaration

// Module class declaration

// Module initialization (at first load)
db.mapping = COLLECTIONS

// Entry point
db.open( DB_URL, DB_NAME )
.then( ()=> {
  debug( 'DB ready, stat webserver' );

  api.listen( CONFIG.port );
  debug( 'Server ready on port %d', CONFIG.port );
} )


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78